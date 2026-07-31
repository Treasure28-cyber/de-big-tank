-- Initial content-management schema. Orders and reservations are intentionally absent.
CREATE TYPE "ServiceLine" AS ENUM ('RESTAURANT', 'BAKERY', 'LOUNGE');
CREATE TYPE "AdminRole" AS ENUM ('ADMIN');

CREATE TABLE "Admin" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "serviceLine" "ServiceLine" NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "imageUrl" TEXT,
  "altText" TEXT,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "allowsSpecialNotes" BOOLEAN NOT NULL DEFAULT false,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceDelta" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GalleryImage" (
  "id" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "altText" TEXT NOT NULL,
  "caption" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Promotion" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "businessName" TEXT NOT NULL DEFAULT 'De Big Tank',
  "tagline" TEXT NOT NULL DEFAULT 'Restaurant, Bakery & Lounge',
  "whatsappNumber" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "mapEmbedUrl" TEXT,
  "businessHours" JSONB NOT NULL DEFAULT '[]',
  "socialLinks" JSONB NOT NULL DEFAULT '{}',
  "heroTitle" TEXT,
  "heroSubtitle" TEXT,
  "heroImageUrl" TEXT,
  "heroImageAlt" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_serviceLine_sortOrder_idx" ON "Category"("serviceLine", "sortOrder");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_isAvailable_idx" ON "Product"("categoryId", "isAvailable");
CREATE UNIQUE INDEX "Promotion_slug_key" ON "Promotion"("slug");
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
