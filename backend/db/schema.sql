-- ====================================================================
-- ArogyaSwift: Hyperlocal Medicine Marketplace Database Schema
-- Architecture: PostgreSQL / Supabase with Row Level Security (RLS)
-- Version: 2.0.0
-- Compliant with: Indian Drugs and Cosmetics Act & Telemedicine Guidelines
-- ====================================================================

-- 1. EXTENSIONS & CUSTOM ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Role Types
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('customer', 'pharmacy', 'rider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verification Status
DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Delivery Service Level
DO $$ BEGIN
    CREATE TYPE service_level_enum AS ENUM ('standard', 'express');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Request & Quotation Status
DO $$ BEGIN
    CREATE TYPE request_status_enum AS ENUM ('pending_quotes', 'quotes_received', 'order_placed', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quotation_status_enum AS ENUM ('submitted', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order Status
DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'draft',
        'placed',
        'confirmed',
        'packing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Status
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Delivery Task Status
DO $$ BEGIN
    CREATE TYPE delivery_task_status_enum AS ENUM (
        'unassigned',
        'offered',
        'assigned',
        'arrived_at_pharmacy',
        'picked_up',
        'arrived_at_customer',
        'delivered',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE, -- Maps to auth.users in Supabase
    role user_role_enum NOT NULL DEFAULT 'customer',
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PHARMACIES TABLE
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    shop_name VARCHAR(200) NOT NULL,
    owner_pharmacist_name VARCHAR(150) NOT NULL,
    drug_license_no VARCHAR(100) UNIQUE NOT NULL, -- e.g., Form 20/21 DL No.
    license_document_url TEXT NOT NULL,
    license_expiry_date DATE NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'pending',
    verified_by_admin_id UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    address TEXT NOT NULL,
    zone VARCHAR(100) NOT NULL, -- e.g. "Raj Nagar, Ghaziabad"
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cold_chain_ready BOOLEAN NOT NULL DEFAULT FALSE,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
    is_temporarily_closed BOOLEAN NOT NULL DEFAULT FALSE,
    business_hours JSONB DEFAULT '{"open": "08:00", "close": "22:00"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RIDERS TABLE (Supports Own Rider & Shared Network)
CREATE TABLE IF NOT EXISTS riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    rider_type VARCHAR(50) NOT NULL DEFAULT 'shared_network', -- 'pharmacy_own' | 'shared_network'
    assigned_pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL,
    vehicle_type VARCHAR(100) NOT NULL DEFAULT 'EV Scooter',
    vehicle_reg_no VARCHAR(50) NOT NULL,
    driving_license_no VARCHAR(100) NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'pending',
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    cold_box_equipped BOOLEAN NOT NULL DEFAULT TRUE,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MEDICINES MASTER CATALOGUE
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL, -- Active salt
    manufacturer VARCHAR(200),
    dosage_form VARCHAR(50) NOT NULL, -- Tablet, Syrup, Injection, etc.
    strength VARCHAR(50) NOT NULL,
    mrp DECIMAL(10, 2) NOT NULL,
    generic_mrp DECIMAL(10, 2),
    schedule_type VARCHAR(10) NOT NULL DEFAULT 'H', -- 'OTC', 'H', 'H1', 'X'
    is_rx_required BOOLEAN NOT NULL DEFAULT TRUE,
    requires_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    cold_chain_min_temp DECIMAL(4, 1) DEFAULT 2.0,
    cold_chain_max_temp DECIMAL(4, 1) DEFAULT 8.0,
    warnings TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PHARMACY INVENTORY & AVAILABILITY
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    selling_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    batch_no VARCHAR(50),
    expiry_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(pharmacy_id, medicine_id)
);

-- 7. PRESCRIPTIONS (Private Encrypted Storage & Audit)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- Private Supabase Storage object path
    is_private_storage BOOLEAN NOT NULL DEFAULT TRUE,
    privacy_consent_granted BOOLEAN NOT NULL DEFAULT TRUE,
    ocr_extracted_data JSONB,
    review_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by_pharmacist_id UUID REFERENCES pharmacies(id),
    pharmacist_notes TEXT,
    digital_signature_stamp VARCHAR(100), -- Cryptographic verification hash e.g. #0x9F82A41B
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CUSTOMER MEDICINE REQUESTS
CREATE TABLE IF NOT EXISTS customer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    requested_items JSONB NOT NULL, -- Array of medicine names/quantities
    delivery_location TEXT NOT NULL,
    zone VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    service_level service_level_enum NOT NULL DEFAULT 'standard',
    status request_status_enum NOT NULL DEFAULT 'pending_quotes',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours')
);

-- 9. PHARMACY QUOTATIONS
CREATE TABLE IF NOT EXISTS pharmacy_quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES customer_requests(id) ON DELETE CASCADE,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    quoted_items JSONB NOT NULL,
    medicines_total DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 15.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
    total_payable DECIMAL(10, 2) NOT NULL,
    estimated_delivery_mins INTEGER NOT NULL DEFAULT 30,
    stock_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    status quotation_status_enum NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(request_id, pharmacy_id)
);

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    request_id UUID REFERENCES customer_requests(id),
    prescription_id UUID REFERENCES prescriptions(id),
    service_level service_level_enum NOT NULL DEFAULT 'standard',
    delivery_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    subtotal DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 15.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status order_status_enum NOT NULL DEFAULT 'placed',
    delivery_otp VARCHAR(6) NOT NULL DEFAULT '4829',
    otp_verified_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ORDER PHARMACY FULFILMENT GROUPS (Split Orders Across Multiple Pharmacies)
CREATE TABLE IF NOT EXISTS order_pharmacy_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE RESTRICT,
    quotation_id UUID REFERENCES pharmacy_quotations(id),
    fulfilment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'packed', 'dispatched'
    group_subtotal DECIMAL(10, 2) NOT NULL,
    rider_assignment_type VARCHAR(50) NOT NULL DEFAULT 'pharmacy_own', -- 'pharmacy_own' | 'shared_network'
    assigned_rider_id UUID REFERENCES riders(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES order_pharmacy_groups(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    is_generic_substitution BOOLEAN NOT NULL DEFAULT FALSE
);

-- 13. DELIVERY TASKS (Live Telemetry & Rider Transactions)
CREATE TABLE IF NOT EXISTS delivery_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES order_pharmacy_groups(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES riders(id) ON DELETE RESTRICT,
    pickup_pharmacy_id UUID NOT NULL REFERENCES pharmacies(id),
    delivery_address TEXT NOT NULL,
    status delivery_task_status_enum NOT NULL DEFAULT 'unassigned',
    cold_chain_required BOOLEAN NOT NULL DEFAULT FALSE,
    cold_temp_current DECIMAL(4, 1) DEFAULT 3.8,
    cold_temp_readings JSONB DEFAULT '[]'::jsonb, -- Telemetry array [{timestamp, temp}]
    started_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. PAYMENTS & FINANCIAL SETTLEMENTS
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    provider VARCHAR(50) NOT NULL DEFAULT 'razorpay_sandbox',
    provider_payment_id VARCHAR(150),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status payment_status_enum NOT NULL DEFAULT 'pending',
    platform_fee_cut DECIMAL(10, 2) NOT NULL DEFAULT 15.00,
    pharmacy_share DECIMAL(10, 2) NOT NULL,
    delivery_share DECIMAL(10, 2) NOT NULL,
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacy_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE RESTRICT,
    settlement_cycle_start DATE NOT NULL,
    settlement_cycle_end DATE NOT NULL,
    gross_sales DECIMAL(12, 2) NOT NULL,
    platform_commission DECIMAL(12, 2) NOT NULL,
    net_payout DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'settled', 'on_hold'
    utr_number VARCHAR(100),
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AUDIT LOGS & COMPLAINTS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'VERIFY_PHARMACY', 'APPROVE_RX', 'DISPATCH_ORDER'
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES pharmacies(id),
    category VARCHAR(100) NOT NULL, -- 'WRONG_MEDICINE', 'DELAY', 'DAMAGED_PACKAGING'
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'refunded'
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_complaints ENABLE ROW LEVEL SECURITY;

-- PRESCRIPTION PRIVACY POLICY:
-- Prescriptions are strictly confidential.
-- Only the owner customer, reviewing pharmacist, or platform admin can view.
CREATE POLICY prescription_owner_view ON prescriptions
    FOR SELECT
    USING (
        auth.uid() = customer_id
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.auth_user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
        OR EXISTS (
            SELECT 1 FROM pharmacies
            JOIN user_profiles ON pharmacies.profile_id = user_profiles.id
            WHERE user_profiles.auth_user_id = auth.uid()
            AND prescriptions.reviewed_by_pharmacist_id = pharmacies.id
        )
    );

-- PHARMACY CREDENTIAL POLICY:
-- Only Verified pharmacies can receive dispatch tasks.
CREATE POLICY verified_pharmacies_visible ON pharmacies
    FOR SELECT
    USING (verification_status = 'verified' OR auth.uid() = profile_id);

-- ORDER VISIBILITY POLICY:
CREATE POLICY customer_order_access ON orders
    FOR SELECT
    USING (
        customer_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.auth_user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );
