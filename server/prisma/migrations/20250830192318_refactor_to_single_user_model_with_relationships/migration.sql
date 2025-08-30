-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hashedPassword" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovieEvent" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "times" TEXT[],
    "format" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ariaLabel" TEXT NOT NULL,
    "genres" TEXT[],
    "description" TEXT,
    "trailerUrl" TEXT,
    "imdbId" TEXT,
    "rottenTomatoesId" TEXT,
    "theatre" TEXT NOT NULL,
    "accessibility" TEXT[],
    "discount" TEXT[],
    "pendingApprovalAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "scrapedAt" TIMESTAMP(3),
    "movieDataId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovieData" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "trailerUrl" TEXT,
    "omdbId" TEXT,
    "imdbId" TEXT,
    "rottenTomatoesId" TEXT,
    "genres" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MovieData_omdbId_key" ON "public"."MovieData"("omdbId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieData_imdbId_key" ON "public"."MovieData"("imdbId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieData_rottenTomatoesId_key" ON "public"."MovieData"("rottenTomatoesId");

-- AddForeignKey
ALTER TABLE "public"."MovieEvent" ADD CONSTRAINT "MovieEvent_movieDataId_fkey" FOREIGN KEY ("movieDataId") REFERENCES "public"."MovieData"("id") ON DELETE SET NULL ON UPDATE CASCADE;
