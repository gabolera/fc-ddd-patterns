import { Op } from "sequelize";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    // Remove all items that are not in the entity
    OrderItemModel.destroy({
      where: {
        order_id: entity.id,
        id: { [Op.notIn]: entity.items.map((item) => item.id) },
      },
    });

    // Search for saved items
    const savedItems = await OrderItemModel.findAll({
      where: {
        order_id: entity.id,
        id: { [Op.in]: entity.items.map((item) => item.id) },
      },
    });

    // Update items
    const forUpdateItems = entity.items.filter((item) => savedItems.find((i) => i.id === item.id));
    forUpdateItems.forEach(async (item) => {
      await OrderItemModel.update(
        {
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        },
        { where: { id: item.id } }
      );
    });

    // Create new items
    const newItemsNotSaved = entity.items.filter((item) => !savedItems.find((i) => i.id === item.id));
    for (const item of newItemsNotSaved) {
      await OrderItemModel.create({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      });
    }

    // Update total of the order
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      { where: { id: entity.id } }
    );
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({
      where: { id },
      include: ["items"],
    });

    return new Order(
      orderModel.id,
      orderModel.customer_id,
      orderModel.items.map((item: any) => {
        return new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        );
      })
    );
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({
      include: ["items"],
    });

    return orderModels.map((orderModel: any) => {
      return new Order(
        orderModel.id,
        orderModel.customer_id,
        orderModel.items.map((item: any) => {
          return new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity
          );
        })
      );
    });
  }
}
