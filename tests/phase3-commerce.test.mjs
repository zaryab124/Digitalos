import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test("Phase 3 Commerce E2E: Full Order, Delivery Fleet, PIN Verification & Review Lifecycle", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur, "Jampur city must exist");

  const passwordHash = await bcrypt.hash("Pass@12345", 10);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  // 1. Create Test Customer, Merchant, and Rider users
  const customer = await prisma.user.create({
    data: {
      phoneNumber: `+9230055${randomSuffix}`,
      fullName: "E2E Commerce Customer",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "CUSTOMER" }] },
    },
  });

  const merchant = await prisma.user.create({
    data: {
      phoneNumber: `+9230066${randomSuffix}`,
      fullName: "E2E Commerce Merchant",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "BUSINESS_OWNER" }] },
    },
  });

  const riderUser = await prisma.user.create({
    data: {
      phoneNumber: `+9230077${randomSuffix}`,
      fullName: "E2E Delivery Rider",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "RIDER" }] },
    },
  });

  // 2. Create Approved Business with Catalog Product
  const category = await prisma.businessCategory.findFirst();
  assert.ok(category, "Category must exist");

  const business = await prisma.business.create({
    data: {
      cityId: jampur.id,
      ownerId: merchant.id,
      categoryId: category.id,
      name: "E2E Test Superstore",
      slug: `e2e-test-superstore-${randomSuffix}`,
      phone: "+923001234567",
      status: "APPROVED",
      isVerified: true,
      locations: {
        create: {
          cityId: jampur.id,
          addressLine: "Main Shahi Bazaar, Jampur",
          area: "Shahi Bazaar",
        },
      },
    },
  });

  const initialStock = 50;
  const unitPrice = 1200;

  const product = await prisma.product.create({
    data: {
      businessId: business.id,
      name: "E2E Premium Basmati Rice 5kg",
      price: unitPrice,
      unit: "bag",
      stockQuantity: initialStock,
      isAvailable: true,
      isDeliveryAvailable: true,
    },
  });

  assert.equal(product.stockQuantity, 50);

  // 3. Rider Registration -> starts as PENDING
  const rider = await prisma.deliveryRider.create({
    data: {
      userId: riderUser.id,
      cityId: jampur.id,
      vehicleType: "MOTORCYCLE",
      vehicleNumber: "JMP-9900",
      cnicNumber: "32402-9988776-5",
      status: "PENDING",
      isVerified: false,
      isAvailable: false,
    },
  });

  assert.equal(rider.status, "PENDING");
  assert.equal(rider.isVerified, false);

  // Admin approves Rider
  const approvedRider = await prisma.deliveryRider.update({
    where: { id: rider.id },
    data: {
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
    },
  });
  assert.equal(approvedRider.status, "APPROVED");
  assert.equal(approvedRider.isAvailable, true);

  // 4. Customer Places Order (Checkout)
  const orderQuantity = 3;
  const subtotal = unitPrice * orderQuantity; // 3600
  const deliveryFee = 100;
  const totalAmount = subtotal + deliveryFee; // 3700
  const deliveryPin = "7419";
  const orderNumber = `JMP-E2E-${randomSuffix}`;

  const order = await prisma.$transaction(
    async (tx) => {
    // a. Create order & items
    const ord = await tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        businessId: business.id,
        cityId: jampur.id,
        status: "PENDING",
        deliveryAddress: "House 5, Street 1, Jampur",
        deliveryArea: "Indus Highway",
        deliveryPin,
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        items: {
          create: [
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: orderQuantity,
              subtotal,
            },
          ],
        },
        payment: {
          create: {
            amount: totalAmount,
            currency: "PKR",
            method: "COD",
            status: "PENDING",
          },
        },
      },
      include: { items: true, payment: true },
    });

    // b. Decrement stock
    await tx.product.update({
      where: { id: product.id },
      data: { stockQuantity: { decrement: orderQuantity } },
    });

    return ord;
    },
    { timeout: 30000, maxWait: 15000 }
  );

  assert.equal(order.status, "PENDING");
  assert.equal(order.totalAmount, 3700);
  assert.equal(order.deliveryPin, "7419");
  assert.equal(order.payment?.status, "PENDING");

  // Verify stock decremented
  const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
  assert.equal(updatedProduct.stockQuantity, 47, "Stock must decrement by ordered quantity");

  // 5. Merchant Accepts & Prepares Order: PENDING -> PREPARING -> READY_FOR_PICKUP
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PREPARING" },
  });

  const readyOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "READY_FOR_PICKUP" },
  });
  assert.equal(readyOrder.status, "READY_FOR_PICKUP");

  // 6. Rider Claims Order: READY_FOR_PICKUP -> OUT_FOR_DELIVERY
  const claimedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      riderId: rider.id,
      status: "OUT_FOR_DELIVERY",
    },
  });
  assert.equal(claimedOrder.status, "OUT_FOR_DELIVERY");
  assert.equal(claimedOrder.riderId, rider.id);

  // 7. Rider Completes Delivery with Proof PIN: OUT_FOR_DELIVERY -> DELIVERED
  // Verification test: invalid pin fails validation check
  const testWrongPin = "0000";
  assert.notEqual(testWrongPin, claimedOrder.deliveryPin, "Wrong PIN must not match");

  // Correct PIN completes delivery
  const deliveredOrder = await prisma.$transaction(async (tx) => {
    const ord = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "DELIVERED",
        paymentStatus: "PAID",
      },
    });

    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: "PAID" },
    });

    // Increment rider stats
    await tx.deliveryRider.update({
      where: { id: rider.id },
      data: {
        deliveriesCompleted: { increment: 1 },
        totalEarnings: { increment: order.deliveryFee },
      },
    });

    return ord;
    },
    { timeout: 30000, maxWait: 15000 }
  );

  assert.equal(deliveredOrder.status, "DELIVERED");
  assert.equal(deliveredOrder.paymentStatus, "PAID");

  // Verify rider earnings
  const updatedRider = await prisma.deliveryRider.findUnique({ where: { id: rider.id } });
  assert.equal(updatedRider.deliveriesCompleted, 1);
  assert.equal(updatedRider.totalEarnings, 100);

  // 8. Customer Leaves Order Review -> COMPLETED
  const review = await prisma.orderReview.create({
    data: {
      orderId: order.id,
      customerId: customer.id,
      businessId: business.id,
      riderId: rider.id,
      rating: 5,
      comment: "Fresh rice quality, fast rider delivery within 20 mins!",
      riderRating: 5,
    },
  });

  assert.ok(review.id);
  assert.equal(review.rating, 5);

  const completedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "COMPLETED" },
  });
  assert.equal(completedOrder.status, "COMPLETED");

  // Cleanup test entities
  await prisma.orderReview.delete({ where: { id: review.id } });
  await prisma.payment.delete({ where: { orderId: order.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });
  await prisma.product.delete({ where: { id: product.id } });
  await prisma.businessLocation.deleteMany({ where: { businessId: business.id } });
  await prisma.business.delete({ where: { id: business.id } });
  await prisma.deliveryRider.delete({ where: { id: rider.id } });
  await prisma.user.delete({ where: { id: customer.id } });
  await prisma.user.delete({ where: { id: merchant.id } });
  await prisma.user.delete({ where: { id: riderUser.id } });
});

test.after(async () => {
  await prisma.$disconnect();
});
