import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Product Types if they don't exist
  console.log('Creating product types...');
  
  const productType1 = await prisma.productType.upsert({
    where: { name: 'روغن موتور' },
    update: {},
    create: {
      name: 'روغن موتور',
      description: 'انواع روغن موتور برای خودرو',
      isActive: true,
    },
  });

  const productType2 = await prisma.productType.upsert({
    where: { name: 'فیلتر هوا' },
    update: {},
    create: {
      name: 'فیلتر هوا',
      description: 'فیلتر هوای موتور خودرو',
      isActive: true,
    },
  });

  const productType3 = await prisma.productType.upsert({
    where: { name: 'لاستیک' },
    update: {},
    create: {
      name: 'لاستیک',
      description: 'لاستیک خودرو',
      isActive: true,
    },
  });

  const productType4 = await prisma.productType.upsert({
    where: { name: 'باتری' },
    update: {},
    create: {
      name: 'باتری',
      description: 'باتری خودرو',
      isActive: true,
    },
  });

  console.log('✅ Product types created');

  // Create Sample Products
  console.log('Creating products...');

  const products = [
    {
      name: 'روغن موتور 5W-30 سنتتیک',
      description: 'روغن موتور سنتتیک با کیفیت بالا برای موتورهای بنزینی',
      price: 450000.00,
      stock: 50,
      productTypeId: productType1.id,
      groupByItem: productType1.name,
    },
    {
      name: 'روغن موتور 10W-40',
      description: 'روغن موتور برای موتورهای دیزلی',
      price: 380000.00,
      stock: 30,
      productTypeId: productType1.id,
      groupByItem: productType1.name,
    },
    {
      name: 'روغن موتور 5W-20',
      description: 'روغن موتور برای موتورهای جدید و کم مصرف',
      price: 420000.00,
      stock: 25,
      productTypeId: productType1.id,
      groupByItem: productType1.name,
    },
    {
      name: 'فیلتر هوای استاندارد',
      description: 'فیلتر هوای موتور استاندارد',
      price: 85000.00,
      stock: 100,
      productTypeId: productType2.id,
      groupByItem: productType2.name,
    },
    {
      name: 'فیلتر هوای کربنی',
      description: 'فیلتر هوای با فیلتر کربنی برای هوای پاک‌تر',
      price: 120000.00,
      stock: 60,
      productTypeId: productType2.id,
      groupByItem: productType2.name,
    },
    {
      name: 'لاستیک رادیال 185/65R15',
      description: 'لاستیک رادیال سایز 185/65R15',
      price: 2500000.00,
      stock: 20,
      productTypeId: productType3.id,
      groupByItem: productType3.name,
    },
    {
      name: 'لاستیک رادیال 205/55R16',
      description: 'لاستیک رادیال سایز 205/55R16',
      price: 3200000.00,
      stock: 15,
      productTypeId: productType3.id,
      groupByItem: productType3.name,
    },
    {
      name: 'باتری 60 آمپر',
      description: 'باتری 60 آمپر برای خودروهای معمولی',
      price: 1800000.00,
      stock: 40,
      productTypeId: productType4.id,
      groupByItem: productType4.name,
    },
    {
      name: 'باتری 70 آمپر',
      description: 'باتری 70 آمپر برای خودروهای بزرگ‌تر',
      price: 2100000.00,
      stock: 30,
      productTypeId: productType4.id,
      groupByItem: productType4.name,
    },
    {
      name: 'باتری 100 آمپر',
      description: 'باتری 100 آمپر برای خودروهای تجاری',
      price: 2800000.00,
      stock: 20,
      productTypeId: productType4.id,
      groupByItem: productType4.name,
    },
  ];

  // Update existing products to set groupByItem if missing
  const existingProducts = await prisma['product'].findMany({
    where: {
      OR: [
        { ['groupByItem']: null } as any,
        { ['groupByItem']: '' } as any,
      ],
    },
    include: {
      productType: true,
    },
  });

  for (const product of existingProducts as any[]) {
    if (product.productType) {
      await prisma['product'].update({
        where: { id: product.id },
        data: { ['groupByItem']: product.productType.name } as any,
      });
    }
  }

  if (existingProducts.length > 0) {
    console.log(`✅ Updated ${existingProducts.length} existing products with groupByItem`);
  }

  // Delete existing products first to avoid duplicates
  // Note: If TypeScript shows errors here, stop any running servers and run: npm run db:generate
  await prisma['product'].deleteMany({});
  
  // Create all products
  for (const product of products) {
    await prisma['product'].create({
      data: product,
    });
  }

  console.log('✅ Products created');
  console.log(`✨ Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

