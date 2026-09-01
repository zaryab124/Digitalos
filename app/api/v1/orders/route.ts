import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "merchant", "rider", "customer"

    let where: any = {};

    if (filter === "merchant") {
      // Find businesses owned by this user
      const myBusinesses = await prisma.business.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      where = { businessId: { in: myBusinesses.map((b) => b.id) } };
    } else if (filter === "rider") {
      const rider = await prisma.deliveryRider.findUnique({
        where: { userId: user.id },
      });
      if (rider) {
        where = { riderId: rider.id };
      }
    } else if (filter === "customer" || !user.roles.includes("ADMIN")) {
      where = { customerId: user.id };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        business: {
          select: { id: true, name: true, nameUr: true, slug: true, phone: true, locations: true },
        },
        customer: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        rider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch orders." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to place an order." } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = checkoutSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid checkout data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Verify business exists and is approved
    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
      include: { owner: true },
    });

    if (!business || business.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, error: { code: "BUSINESS_NOT_AVAILABLE", message: "Store is currently unavailable." } },
        { status: 400 }
      );
    }

    // Fetch products and verify pricing & stock
    const productIds = data.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: data.businessId,
        isAvailable: true,
      },
    });

    if (dbProducts.length !== data.items.length) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PRODUCTS", message: "One or more products are unavailable in this shop." } },
        { status: 400 }
      );
    }

    // Calculate subtotal and construct line items
    let subtotal = 0;
    const orderItemsToCreate: Array<{
      productId: string;
      name: string;
      nameUr: string | null;
      unit: string;
      price: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of data.items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId)!;
      if (dbProd.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "OUT_OF_STOCK",
              message: `Insufficient stock for ${dbProd.name}. Available: ${dbProd.stockQuantity}`,
            },
          },
          { status: 400 }
        );
      }

      const itemTotal = dbProd.price * item.quantity;
      subtotal += itemTotal;

      orderItemsToCreate.push({
        productId: dbProd.id,
        name: dbProd.name,
        nameUr: dbProd.nameUr,
        unit: dbProd.unit,
        price: dbProd.price,
        quantity: item.quantity,
        subtotal: itemTotal,
      });
    }

    const deliveryFee = 100.0; // Standard local delivery fee in PKR
    const discountAmount = 0.0;
    const totalAmount = subtotal + deliveryFee - discountAmount;

    // Generate readable order number and 4-digit proof-of-delivery PIN
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `JMP-${Date.now().toString().slice(-4)}-${randomSuffix}`;
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();

    // Atomic creation
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: user.id,
          businessId: data.businessId,
          cityId: data.cityId,
          status: "PENDING",
          deliveryAddress: data.deliveryAddress,
          deliveryArea: data.deliveryArea,
          deliveryNotes: data.deliveryNotes || null,
          deliveryPin,
          subtotal,
          deliveryFee,
          discountAmount,
          totalAmount,
          paymentMethod: data.paymentMethod,
          paymentStatus: "PENDING",
          items: {
            create: orderItemsToCreate,
          },
          payment: {
            create: {
              amount: totalAmount,
              currency: "PKR",
              method: data.paymentMethod,
              status: "PENDING",
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      // 2. Decrement stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      // 3. Notify merchant
      await tx.notification.create({
        data: {
          userId: business.ownerId,
          title: `New Order #${orderNumber} (${business.name})`,
          titleUr: "نیا آرڈر موصول ہوا",
          message: `Order #${orderNumber} received for PKR ${totalAmount}. Tap to view and accept.`,
          messageUr: `نیا آرڈر #${orderNumber} (${totalAmount} روپے) موصول ہوا۔ آرڈر دیکھنے کیلئے کلک کریں۔`,
          type: "ORDER_STATUS",
          link: `/merchant/dashboard`,
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully! The shopkeeper will confirm shortly.",
        data: { order },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to place order." } },
      { status: 500 }
    );
  }
}
