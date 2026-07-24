import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

const rules = readFileSync(
  new URL("../firestore.rules", import.meta.url),
  "utf8"
);

let environment;

before(async () => {
  assert.ok(
    process.env.FIRESTORE_EMULATOR_HOST,
    "Run rules tests through the Firestore emulator"
  );

  environment = await initializeTestEnvironment({
    projectId: "deeplink-menu-rules-test",
    firestore: { rules },
  });

  const now = Date.now();
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore();

    await setDoc(doc(database, "businesses", "active-owner"), {
      businessName: "Active Cafe",
      trialUsed: false,
      subscription: {
        status: "active",
        plan: "six_months",
        expiresAt: Timestamp.fromMillis(now + 60 * 60 * 1000),
        lastPaymentId: "existing-code",
      },
    });

    await setDoc(doc(database, "businesses", "expired-owner"), {
      businessName: "Expired Cafe",
      trialUsed: true,
      subscription: {
        status: "active",
        plan: "one_day",
        expiresAt: Timestamp.fromMillis(now - 60 * 1000),
        lastPaymentId: "free_trial",
      },
    });

    await setDoc(
      doc(database, "businesses", "active-owner", "menuItems", "coffee"),
      { name: "Coffee", price: "500", isAvailable: true }
    );

    await setDoc(
      doc(database, "businesses", "expired-owner", "menuItems", "tea"),
      { name: "Tea", price: "400", isAvailable: true }
    );

    await setDoc(doc(database, "businesses", "trial-owner"), {
      businessName: "Trial Cafe",
      trialUsed: false,
    });

    await setDoc(doc(database, "paymentCodes", "DL6M1234"), {
      plan: "six_months",
      status: "unused",
      usedBy: "",
      usedAt: null,
    });

    await setDoc(doc(database, "businesses", "paid-owner"), {
      businessName: "Paid Cafe",
      trialUsed: true,
    });
  });
});

after(async () => {
  await environment?.cleanup();
});

test("public users can fetch a known business but cannot enumerate businesses", async () => {
  const database = environment.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(database, "businesses", "active-owner")));
  await assertFails(getDocs(collection(database, "businesses")));
});

test("public menu reads require an active unexpired subscription", async () => {
  const database = environment.unauthenticatedContext().firestore();

  await assertSucceeds(
    getDoc(
      doc(database, "businesses", "active-owner", "menuItems", "coffee")
    )
  );
  await assertFails(
    getDoc(
      doc(database, "businesses", "expired-owner", "menuItems", "tea")
    )
  );
});

test("owners retain menu access while other authenticated users cannot write", async () => {
  const ownerDatabase = environment
    .authenticatedContext("expired-owner")
    .firestore();
  const otherDatabase = environment
    .authenticatedContext("another-user")
    .firestore();

  await assertSucceeds(
    getDoc(
      doc(ownerDatabase, "businesses", "expired-owner", "menuItems", "tea")
    )
  );
  await assertFails(
    setDoc(
      doc(otherDatabase, "businesses", "expired-owner", "menuItems", "rice"),
      { name: "Rice", price: "600" }
    )
  );
});

test("owners can update profile fields but cannot self-activate arbitrary subscriptions", async () => {
  const database = environment
    .authenticatedContext("expired-owner")
    .firestore();
  const businessReference = doc(database, "businesses", "expired-owner");

  await assertSucceeds(
    updateDoc(businessReference, {
      businessName: "Updated Cafe",
      updatedAt: serverTimestamp(),
    })
  );

  await assertFails(
    updateDoc(businessReference, {
      subscription: {
        status: "active",
        plan: "one_year",
        expiresAt: Timestamp.fromMillis(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lastPaymentId: "made-up-code",
      },
      updatedAt: serverTimestamp(),
    })
  );
});

test("owners can activate one bounded free trial", async () => {
  const database = environment
    .authenticatedContext("trial-owner")
    .firestore();

  await assertSucceeds(
    updateDoc(doc(database, "businesses", "trial-owner"), {
      trialUsed: true,
      subscription: {
        status: "active",
        plan: "one_day",
        startedAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
        lastPaymentId: "free_trial",
      },
      updatedAt: serverTimestamp(),
    })
  );
});

test("a paid subscription requires atomically consuming a matching code", async () => {
  const database = environment
    .authenticatedContext("paid-owner")
    .firestore();
  const businessReference = doc(database, "businesses", "paid-owner");
  const codeReference = doc(database, "paymentCodes", "DL6M1234");

  await assertSucceeds(
    runTransaction(database, async (transaction) => {
      await transaction.get(codeReference);
      await transaction.get(businessReference);

      transaction.update(businessReference, {
        subscription: {
          status: "active",
          plan: "six_months",
          startedAt: serverTimestamp(),
          expiresAt: Timestamp.fromMillis(
            Date.now() + 180 * 24 * 60 * 60 * 1000
          ),
          lastPaymentId: "DL6M1234",
        },
        updatedAt: serverTimestamp(),
      });

      transaction.update(codeReference, {
        status: "used",
        usedBy: "paid-owner",
        usedAt: serverTimestamp(),
      });
    })
  );
});
