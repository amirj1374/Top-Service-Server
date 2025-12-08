import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Type assertion to fix TypeScript language server cache issue
// The Prisma client is correctly generated and works at runtime
const prisma = new PrismaClient() as PrismaClient & {
  carModel: any;
  car: any;
  customer: any;
};

async function main() {
  console.log('🌱 Starting seed...');

  // Create a test user if it doesn't exist
  console.log('Creating test user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      customizer: 'default-theme',
      age: 30,
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // Create Services
  console.log('Creating services...');
  const services = [
    {
      name: 'بالانس',
      price: 150000,
      description: 'بالانس چرخ',
      isActive: true,
    },
    {
      name: 'تنظیم باد',
      price: 50000,
      description: 'تنظیم باد لاستیک‌ها',
      isActive: true,
    },
    {
      name: 'تعویض روغن',
      price: 250000,
      description: 'تعویض روغن موتور به همراه فیلتر',
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma['service'].upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }
  console.log(`✅ Services created (${services.length})`);

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

  // Create Car Models - Iranian Cars
  console.log('Creating car models...');

  const carModels = [
    // پژو
    { id: '00000000-0000-0000-0000-000000000001', name: 'پژو 206', brand: 'پژو' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'پژو 207', brand: 'پژو' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'پژو 405', brand: 'پژو' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'پژو پارس', brand: 'پژو' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'پژو 2008', brand: 'پژو' },
    { id: '00000000-0000-0000-0000-000000000006', name: 'پژو 301', brand: 'پژو' },
    
    // ایران خودرو
    { id: '00000000-0000-0000-0000-000000000007', name: 'سمند', brand: 'ایران خودرو' },
    { id: '00000000-0000-0000-0000-000000000008', name: 'دنا', brand: 'ایران خودرو' },
    { id: '00000000-0000-0000-0000-000000000009', name: 'ساینا', brand: 'ایران خودرو' },
    { id: '00000000-0000-0000-0000-000000000010', name: 'رانا', brand: 'ایران خودرو' },
    { id: '00000000-0000-0000-0000-000000000011', name: 'پژو پارس', brand: 'ایران خودرو' },
    { id: '00000000-0000-0000-0000-000000000012', name: 'آریو', brand: 'ایران خودرو' },
    { id: '00000000-0000-0000-0000-000000000013', name: 'دنا پلاس', brand: 'ایران خودرو' },
    { id: '00000000-0000-0000-0000-000000000014', name: 'سمند EF7', brand: 'ایران خودرو' },
    
    // سایپا
    { id: '00000000-0000-0000-0000-000000000015', name: 'تیبا', brand: 'سایپا' },
    { id: '00000000-0000-0000-0000-000000000016', name: 'کویک', brand: 'سایپا' },
    { id: '00000000-0000-0000-0000-000000000017', name: 'ساینا', brand: 'سایپا' },
    { id: '00000000-0000-0000-0000-000000000018', name: 'شاهین', brand: 'سایپا' },
    { id: '00000000-0000-0000-0000-000000000019', name: 'پراید', brand: 'سایپا' },
    { id: '00000000-0000-0000-0000-000000000020', name: 'تیبا 2', brand: 'سایپا' },
    { id: '00000000-0000-0000-0000-000000000021', name: 'کویک R', brand: 'سایپا' },
    { id: '00000000-0000-0000-0000-000000000022', name: 'آریو', brand: 'سایپا' },
    
    // سایر برندها
    { id: '00000000-0000-0000-0000-000000000023', name: 'کورولا', brand: 'تویوتا' },
    { id: '00000000-0000-0000-0000-000000000024', name: 'یاریس', brand: 'تویوتا' },
    { id: '00000000-0000-0000-0000-000000000025', name: 'کمری', brand: 'تویوتا' },
    { id: '00000000-0000-0000-0000-000000000026', name: 'سانتافه', brand: 'هیوندای' },
    { id: '00000000-0000-0000-0000-000000000027', name: 'النترا', brand: 'هیوندای' },
    { id: '00000000-0000-0000-0000-000000000028', name: 'سونا', brand: 'هیوندای' },
    { id: '00000000-0000-0000-0000-000000000029', name: 'نیسان پاترول', brand: 'نیسان' },
    { id: '00000000-0000-0000-0000-000000000030', name: 'نیسان آلتیمو', brand: 'نیسان' },
  ];

  const createdCarModels: Array<{ id: string; name: string; brand: string | null }> = [];
  for (const model of carModels) {
    const created = await prisma.carModel.upsert({
      where: { id: model.id },
      update: {},
      create: model,
    });
    createdCarModels.push(created);
  }

  console.log('✅ Car models created');
  console.log(`✨ Seeded ${createdCarModels.length} car models`);

  // Create Customers with Cars (one customer can have many cars)
  console.log('Creating customers with cars...');

  // Delete existing cars first, then customers
  await prisma.car.deleteMany({});
  await prisma.customer.deleteMany({});

  const customersData = [
    {
      id: '00000000-0000-0000-0000-000000000201',
      fullName: 'علی احمدی',
      phone: '09123456789',
      cars: [
        { title: 'پژو 206 صندوق دار', plate: '12 م 345 67', carModelId: createdCarModels[0]!.id },
        { title: 'پژو 207 صندوق دار', plate: '23 ب 456 78', carModelId: createdCarModels[1]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000202',
      fullName: 'محمد رضایی',
      phone: '09123456790',
      cars: [
        { title: 'پژو 206 صندوق دار', plate: '34 ج 567 89', carModelId: createdCarModels[0]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000203',
      fullName: 'حسن کریمی',
      phone: '09123456791',
      cars: [
        { title: 'پژو 405 صندوق دار', plate: '45 د 678 90', carModelId: createdCarModels[2]!.id },
        { title: 'پژو پارس صندوق دار', plate: '56 ر 789 01', carModelId: createdCarModels[3]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000204',
      fullName: 'رضا موسوی',
      phone: '09123456792',
      cars: [
        { title: 'پژو 2008', plate: '67 س 890 12', carModelId: createdCarModels[4]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000205',
      fullName: 'امیر حسینی',
      phone: '09123456793',
      cars: [
        { title: 'سمند صندوق دار', plate: '78 ص 901 23', carModelId: createdCarModels[6]!.id },
        { title: 'دنا صندوق دار', plate: '89 ط 012 34', carModelId: createdCarModels[7]!.id },
        { title: 'دنا پلاس', plate: '90 ع 123 45', carModelId: createdCarModels[12]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000206',
      fullName: 'سعید نوری',
      phone: '09123456794',
      cars: [
        { title: 'ساینا صندوق دار', plate: '01 ف 234 56', carModelId: createdCarModels[8]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000207',
      fullName: 'فرهاد صادقی',
      phone: '09123456795',
      cars: [
        { title: 'تیبا 2', plate: '11 ق 345 67', carModelId: createdCarModels[14]!.id },
        { title: 'تیبا 2', plate: '22 ک 456 78', carModelId: createdCarModels[14]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000208',
      fullName: 'کامران زارع',
      phone: '09123456796',
      cars: [
        { title: 'کویک', plate: '33 گ 567 89', carModelId: createdCarModels[15]!.id },
        { title: 'کویک R', plate: '44 ل 678 90', carModelId: createdCarModels[20]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000209',
      fullName: 'بهرام یوسفی',
      phone: '09123456797',
      cars: [
        { title: 'پراید 111', plate: '55 م 789 01', carModelId: createdCarModels[18]!.id },
        { title: 'پراید 132', plate: '66 ن 890 12', carModelId: createdCarModels[18]!.id },
        { title: 'پراید 141', plate: '77 و 901 23', carModelId: createdCarModels[18]!.id },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000210',
      fullName: 'داریوش مهدوی',
      phone: '09123456798',
      cars: [
        { title: 'کورولا', plate: '88 ه 012 34', carModelId: createdCarModels[22]!.id },
        { title: 'یاریس', plate: '99 ی 123 45', carModelId: createdCarModels[23]!.id },
      ],
    },
  ];

  // Create all customers with their cars
  for (const customerData of customersData) {
    await prisma.customer.create({
      data: {
        id: customerData.id,
        fullName: customerData.fullName,
        phone: customerData.phone,
        cars: {
          create: customerData.cars,
        },
      },
    });
  }

  console.log('✅ Customers with cars created');
  console.log(`✨ Seeded ${customersData.length} customers`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

