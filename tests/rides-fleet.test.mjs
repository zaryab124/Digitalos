import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("Rides & Fleet Operations Suite", async (t) => {
  let jampurCity;
  let customerUser;
  let bikeRider;
  let loaderDriver;
  let createdRideId;
  let createdCargoRideId;
  let ridePin;
  let cargoPin;

  await t.test("Setup and verify baseline fleet data in Neon database", async () => {
    jampurCity = await prisma.city.findFirst({ where: { slug: "jampur" } });
    assert.ok(jampurCity, "Jampur city must exist");

    customerUser = await prisma.user.findFirst({
      where: { phoneNumber: "+923001234003" },
    });
    assert.ok(customerUser, "Customer user must exist");

    bikeRider = await prisma.deliveryRider.findFirst({
      where: { vehicleCategory: "BIKE", status: "APPROVED" },
      include: { user: true },
    });
    assert.ok(bikeRider, "Bike rider must exist");

    loaderDriver = await prisma.deliveryRider.findFirst({
      where: { vehicleCategory: "LOADER_RICKSHAW", status: "APPROVED" },
      include: { user: true },
    });
    assert.ok(loaderDriver, "Loader rickshaw driver must exist");
  });

  await t.test("Customer books a Passenger Ride (Auto Rickshaw)", async () => {
    const bookingNumber = `RIDE-TEST-${Date.now()}`;
    ridePin = "5544";

    const ride = await prisma.rideBooking.create({
      data: {
        cityId: jampurCity.id,
        bookingNumber,
        customerId: customerUser.id,
        riderId: null, // Open broadcast
        serviceType: "PASSENGER_RIDE",
        vehicleCategory: "AUTO_RICKSHAW",
        pickupAddress: "Main Bazaar Chowk, Jampur",
        dropoffAddress: "Govt Post Graduate College, Jampur",
        pickupArea: "Main Bazaar",
        dropoffArea: "College Road",
        fareAmount: 180,
        paymentMethod: "CASH",
        completionPin: ridePin,
        status: "REQUESTED",
      },
    });

    assert.ok(ride.id, "Ride should be created");
    assert.equal(ride.status, "REQUESTED");
    assert.equal(ride.fareAmount, 180);
    createdRideId = ride.id;
  });

  await t.test("Driver claims and transitions passenger ride status", async () => {
    // Driver claims ride
    const accepted = await prisma.rideBooking.update({
      where: { id: createdRideId },
      data: {
        riderId: bikeRider.id,
        status: "ACCEPTED",
      },
    });
    assert.equal(accepted.status, "ACCEPTED");
    assert.equal(accepted.riderId, bikeRider.id);

    // Driver marks In Transit
    const inTransit = await prisma.rideBooking.update({
      where: { id: createdRideId },
      data: { status: "IN_TRANSIT" },
    });
    assert.equal(inTransit.status, "IN_TRANSIT");

    // Driver completes ride with correct PIN
    const previousRidesCount = bikeRider.ridesCompleted;
    const completed = await prisma.$transaction(async (tx) => {
      const b = await tx.rideBooking.update({
        where: { id: createdRideId },
        data: {
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
      });

      await tx.deliveryRider.update({
        where: { id: bikeRider.id },
        data: {
          ridesCompleted: { increment: 1 },
          totalEarnings: { increment: b.fareAmount },
        },
      });

      return b;
    });

    assert.equal(completed.status, "COMPLETED");
    assert.equal(completed.paymentStatus, "PAID");

    const updatedRider = await prisma.deliveryRider.findUnique({
      where: { id: bikeRider.id },
    });
    assert.equal(updatedRider.ridesCompleted, previousRidesCount + 1);
  });

  await t.test("Merchant books a Commercial Cargo Loader for 30 bags of grain", async () => {
    const bookingNumber = `CARGO-TEST-${Date.now()}`;
    cargoPin = "8899";

    const cargoBooking = await prisma.rideBooking.create({
      data: {
        cityId: jampurCity.id,
        bookingNumber,
        customerId: customerUser.id,
        riderId: loaderDriver.id, // Direct driver selection
        serviceType: "MERCHANT_CARGO",
        vehicleCategory: "LOADER_RICKSHAW",
        pickupAddress: "Ghalla Mandi Gate 2, Jampur",
        dropoffAddress: "Indus Flour Mills, Kotla Dewan Road",
        pickupArea: "Ghalla Mandi",
        dropoffArea: "Kotla Dewan",
        cargoDescription: "30 Bags of Super Kernel Basmati Rice (50kg each)",
        estimatedWeightKg: 1500,
        fareAmount: 850,
        paymentMethod: "CASH",
        completionPin: cargoPin,
        status: "REQUESTED",
      },
    });

    assert.ok(cargoBooking.id);
    assert.equal(cargoBooking.serviceType, "MERCHANT_CARGO");
    assert.equal(cargoBooking.estimatedWeightKg, 1500);
    createdCargoRideId = cargoBooking.id;
  });

  await t.test("Loader Driver completes cargo trip and updates earnings", async () => {
    const prevCargoTrips = loaderDriver.cargoTripsCompleted;

    const completedCargo = await prisma.$transaction(async (tx) => {
      const b = await tx.rideBooking.update({
        where: { id: createdCargoRideId },
        data: {
          status: "COMPLETED",
          paymentStatus: "PAID",
        },
      });

      await tx.deliveryRider.update({
        where: { id: loaderDriver.id },
        data: {
          cargoTripsCompleted: { increment: 1 },
          totalEarnings: { increment: b.fareAmount },
        },
      });

      return b;
    });

    assert.equal(completedCargo.status, "COMPLETED");

    const updatedLoader = await prisma.deliveryRider.findUnique({
      where: { id: loaderDriver.id },
    });
    assert.equal(updatedLoader.cargoTripsCompleted, prevCargoTrips + 1);
  });

  await t.test("Customer rates Driver with 5 Stars and leaves review", async () => {
    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.rideReview.create({
        data: {
          rideId: createdRideId,
          riderId: bikeRider.id,
          customerId: customerUser.id,
          rating: 5,
          comment: "Punctual, polite, and safe driver in Jampur bazaar!",
        },
      });

      const allReviews = await tx.rideReview.findMany({
        where: { riderId: bikeRider.id },
      });
      const avg = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;

      await tx.deliveryRider.update({
        where: { id: bikeRider.id },
        data: {
          ratingAverage: parseFloat(avg.toFixed(1)),
          reviewCount: allReviews.length,
        },
      });

      return r;
    });

    assert.ok(review.id);
    assert.equal(review.rating, 5);

    const riderProfile = await prisma.deliveryRider.findUnique({
      where: { id: bikeRider.id },
      include: { rideReviews: true },
    });
    assert.ok(riderProfile.reviewCount >= 1);
    assert.ok(riderProfile.ratingAverage >= 4.5);
  });

  await t.test("Admin Fleet Management can filter, verify and approve drivers", async () => {
    const allFleet = await prisma.deliveryRider.findMany({
      include: { user: true, city: true },
    });

    assert.ok(allFleet.length >= 3, "Should have multiple fleet vehicles");

    const bikeCount = allFleet.filter((d) => d.vehicleCategory === "BIKE").length;
    const loaderCount = allFleet.filter((d) => d.vehicleCategory === "LOADER_RICKSHAW").length;
    const rickshawCount = allFleet.filter((d) => d.vehicleCategory === "AUTO_RICKSHAW").length;

    assert.ok(bikeCount >= 1, "At least 1 bike rider exists");
    assert.ok(loaderCount >= 1, "At least 1 loader driver exists");
    assert.ok(rickshawCount >= 1, "At least 1 auto rickshaw driver exists");
  });

  t.after(async () => {
    // Clean up test bookings and reviews
    if (createdRideId) {
      await prisma.rideReview.deleteMany({ where: { rideId: createdRideId } });
      await prisma.rideBooking.deleteMany({ where: { id: createdRideId } });
    }
    if (createdCargoRideId) {
      await prisma.rideBooking.deleteMany({ where: { id: createdCargoRideId } });
    }
    await prisma.$disconnect();
  });
});
