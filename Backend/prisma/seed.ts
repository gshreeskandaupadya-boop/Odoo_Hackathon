import { db } from "./db.ts";
import { Client } from "pg";
import bcrypt from "bcryptjs";

const DEMO_PASSWORDS = {
    sales: "demo-sales-password",
    manager: "demo-manager-password",
    finance: "demo-finance-password",
    admin: "demo-admin-password",
};

async function resetApplicationData() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`
        TRUNCATE TABLE
            "orderAllocation",
            "order",
            "negotiation",
            "approval",
            "quoteItem",
            "quote",
            "inventory",
            "warehouse",
            "product",
            "customer",
            "auditLog",
            "user"
        RESTART IDENTITY CASCADE
    `);
    await client.end();
}

async function main() {
    console.log("🌱 Starting DealFlow360 seed...");
    await resetApplicationData();
    console.log("🧹 Cleared existing application data.");

    // -------------------------
    // USERS
    // -------------------------

    const users = await db.orm.public.User.createAll([
        {
            email: "sales@dealflow360.com",
            passwordHash: await bcrypt.hash(DEMO_PASSWORDS.sales, 12),
            name: "Alex Sales",
            role: "SALES_REP",
        },
        {
            email: "manager@dealflow360.com",
            passwordHash: await bcrypt.hash(DEMO_PASSWORDS.manager, 12),
            name: "Sarah Manager",
            role: "SALES_MANAGER",
        },
        {
            email: "finance@dealflow360.com",
            passwordHash: await bcrypt.hash(DEMO_PASSWORDS.finance, 12),
            name: "Mike Finance",
            role: "FINANCE",
        },
        {
            email: "admin@dealflow360.com",
            passwordHash: await bcrypt.hash(DEMO_PASSWORDS.admin, 12),
            name: "Admin User",
            role: "ADMIN",
        },
    ]);

    // -------------------------
    // CUSTOMERS
    // -------------------------

    const customers = await db.orm.public.Customer.createAll([
        {
            name: "Rahul Sharma",
            company: "Sharma Technologies",
            email: "rahul@sharmatech.com",
            tier: "STANDARD",
        },
        {
            name: "Priya Patel",
            company: "Patel Enterprises",
            email: "priya@patelenterprises.com",
            tier: "SILVER",
        },
        {
            name: "Arjun Mehta",
            company: "Mehta Solutions",
            email: "arjun@mehtasolutions.com",
            tier: "GOLD",
        },
        {
            name: "Ananya Rao",
            company: "Rao Industries",
            email: "ananya@raoindustries.com",
            tier: "PLATINUM",
        },
    ]);

    // -------------------------
    // PRODUCTS
    // -------------------------

    const products = await db.orm.public.Product.createAll([
        {
            sku: "LAP-001",
            name: "Business Laptop Pro",
            category: "Laptops",
            description: "Professional laptop for enterprise customers",
            sellingPrice: 80000,
            costPrice: 60000,
            allowedDiscountPct: 15,
        },
        {
            sku: "MON-001",
            name: "27-inch 4K Monitor",
            category: "Monitors",
            description: "4K professional display",
            sellingPrice: 35000,
            costPrice: 24000,
            allowedDiscountPct: 10,
        },
        {
            sku: "WAR-001",
            name: "Extended Warranty",
            category: "Warranty",
            description: "Three-year extended hardware warranty",
            sellingPrice: 4999,
            costPrice: 1800,
            allowedDiscountPct: 5,
        },
        {
            sku: "ACC-001",
            name: "Wireless Business Mouse",
            category: "Accessories",
            description: "Ergonomic wireless mouse",
            sellingPrice: 1499,
            costPrice: 700,
            allowedDiscountPct: 10,
        },
        {
            sku: "DOC-001",
            name: "USB-C Docking Station",
            category: "Accessories",
            description: "Enterprise USB-C docking station",
            sellingPrice: 8999,
            costPrice: 5000,
            allowedDiscountPct: 8,
        },
    ]);

    // -------------------------
    // WAREHOUSES
    // -------------------------

    const warehouses = await db.orm.public.Warehouse.createAll([
        {
            name: "Warehouse A",
            location: "Bengaluru",
        },
        {
            name: "Warehouse B",
            location: "Hyderabad",
        },
        {
            name: "Warehouse C",
            location: "Mumbai",
        },
    ]);

    // -------------------------
    // FIND CREATED RECORDS
    // -------------------------

    const laptop = products.find((p) => p.sku === "LAP-001")!;
    const monitor = products.find((p) => p.sku === "MON-001")!;
    const warranty = products.find((p) => p.sku === "WAR-001")!;
    const mouse = products.find((p) => p.sku === "ACC-001")!;
    const dockingStation = products.find((p) => p.sku === "DOC-001")!;

    const warehouseA = warehouses.find((w) => w.name === "Warehouse A")!;
    const warehouseB = warehouses.find((w) => w.name === "Warehouse B")!;
    const warehouseC = warehouses.find((w) => w.name === "Warehouse C")!;

    // -------------------------
    // INVENTORY
    // -------------------------

    await db.orm.public.Inventory.createAll([
        // Laptop
        {
            productId: laptop.id,
            warehouseId: warehouseA.id,
            quantity: 6,
            reserved: 0,
        },
        {
            productId: laptop.id,
            warehouseId: warehouseB.id,
            quantity: 7,
            reserved: 0,
        },
        {
            productId: laptop.id,
            warehouseId: warehouseC.id,
            quantity: 2,
            reserved: 0,
        },

        // Monitor
        {
            productId: monitor.id,
            warehouseId: warehouseA.id,
            quantity: 10,
            reserved: 0,
        },
        {
            productId: monitor.id,
            warehouseId: warehouseB.id,
            quantity: 5,
            reserved: 0,
        },
        {
            productId: monitor.id,
            warehouseId: warehouseC.id,
            quantity: 8,
            reserved: 0,
        },

        // Warranty
        {
            productId: warranty.id,
            warehouseId: warehouseA.id,
            quantity: 50,
            reserved: 0,
        },
        {
            productId: warranty.id,
            warehouseId: warehouseB.id,
            quantity: 30,
            reserved: 0,
        },

        // Mouse
        {
            productId: mouse.id,
            warehouseId: warehouseA.id,
            quantity: 40,
            reserved: 0,
        },
        {
            productId: mouse.id,
            warehouseId: warehouseB.id,
            quantity: 25,
            reserved: 0,
        },

        // Docking Station
        {
            productId: dockingStation.id,
            warehouseId: warehouseA.id,
            quantity: 15,
            reserved: 0,
        },
        {
            productId: dockingStation.id,
            warehouseId: warehouseB.id,
            quantity: 10,
            reserved: 0,
        },
    ]);

    // -------------------------
    // SUCCESS OUTPUT
    // -------------------------

    console.log("✅ Seed completed successfully.");

    console.log(`
Demo accounts:
Sales Rep:     ${users[0].email}
Sales Manager: ${users[1].email}
Finance:       ${users[2].email}
Admin:         ${users[3].email}

Customers:
- ${customers[0].company} [STANDARD]
- ${customers[1].company} [SILVER]
- ${customers[2].company} [GOLD]
- ${customers[3].company} [PLATINUM]

Products:
- ${laptop.name}
- ${monitor.name}
- ${warranty.name}
- ${mouse.name}
- ${dockingStation.name}

Warehouses:
- ${warehouseA.name}
- ${warehouseB.name}
- ${warehouseC.name}
`);
}

main().catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
});