import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const foundOrder = await orderRepository.find(order.id);

    expect(foundOrder).toStrictEqual(order);
  });

  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("345", "Customer 2");
    const address = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const abacate = new Product("acabate", "Abacate", 5);
    const laranja = new Product("laranja", "Laranja", 3.99);
    const pera = new Product("pera", "Pera", 6.88);
    await productRepository.create(abacate);
    await productRepository.create(laranja);
    await productRepository.create(pera);

    const abacateCart = new OrderItem(
      "1",
      abacate.name,
      abacate.price,
      abacate.id,
      5
    );
    const initialOrder = new Order("1", customer.id, [abacateCart]);
    const orderRepository = new OrderRepository();
    await orderRepository.create(initialOrder);

    const laranjaCart = new OrderItem(
      "2",
      laranja.name,
      laranja.price,
      laranja.id,
      3
    );

    const updatedOrder = new Order("1", customer.id, [
      abacateCart,
      laranjaCart,
    ]);
    await orderRepository.update(updatedOrder);

    const orderModel = await OrderModel.findOne({
      where: { id: initialOrder.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "1",
      customer_id: "345",
      total: updatedOrder.total(),
      items: [
        {
          id: abacateCart.id,
          name: abacateCart.name,
          price: abacateCart.price,
          quantity: abacateCart.quantity,
          order_id: initialOrder.id,
          product_id: abacate.id,
        },
        {
          id: laranjaCart.id,
          name: laranjaCart.name,
          price: laranjaCart.price,
          quantity: laranjaCart.quantity,
          order_id: initialOrder.id,
          product_id: laranja.id,
        },
      ],
    });

    // Removing a item
    const peraCart = new OrderItem("2", pera.name, pera.price, pera.id, 8);
    const removingItemUpdatedOrder = new Order("1", customer.id, [peraCart]);
    await orderRepository.update(removingItemUpdatedOrder);
    const removingItemOrderModel = await OrderModel.findOne({
      where: { id: initialOrder.id },
      include: ["items"],
    });

    expect(removingItemOrderModel.toJSON()).toStrictEqual({
      id: "1",
      customer_id: "345",
      total: removingItemUpdatedOrder.total(),
      items: [
        {
          id: peraCart.id,
          name: peraCart.name,
          price: peraCart.price,
          quantity: peraCart.quantity,
          order_id: initialOrder.id,
          product_id: pera.id,
        },
      ],
    });
  });

  it("should a list of orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("345", "Customer 2");
    const address = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("10", "Product 10", 20);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      5
    );
    const order = new Order("1", customer.id, [orderItem]);
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const productTwo = new Product("101", "Product 101", 80);
    await productRepository.create(productTwo);
    const orderItemTwo = new OrderItem(
      "2",
      productTwo.name,
      productTwo.price,
      productTwo.id,
      5
    );
    const orderTwo = new Order("2", customer.id, [orderItemTwo]);
    await orderRepository.create(orderTwo);

    const orders = await orderRepository.findAll();

    expect([orders, orderTwo]).toEqual([orders, orderTwo]);
  });
});
