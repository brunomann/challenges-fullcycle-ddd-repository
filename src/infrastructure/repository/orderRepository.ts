import Address from "../../domain/entity/address";
import Customer from "../../domain/entity/customer";
import Order from "../../domain/entity/order";
import OrderItem from "../../domain/entity/orderItem";
import Product from "../../domain/entity/product";
import CustomerRepositoryInterface from "../../domain/repository/customerRepositoryInterface";
import OrderRepositoryInterface from "../../domain/repository/orderRepositoryInterface";
import CustomerModel from "../db/sequelize/model/customerModel";
import OrderItemModel from "../db/sequelize/model/orderItemModel";
import OrderModel from "../db/sequelize/model/orderModel";
import ProductModel from "../db/sequelize/model/productModel";

export default class OrderRepository //implements OrderRepositoryInterface
{
    async create(entity: Order): Promise<void> {
        await OrderModel.create({
            id: entity.id,
            customer_id: entity.customerId,
            total: entity.total(),
            items: entity.items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity
            }))
        },
        {include: [{model: OrderItemModel}]}
        );
    }
    
    async update(entity: Order): Promise<void> {
        await OrderModel.update(
            {
                customer_id: entity.customerId,
                total: entity.total(),
            },
            {
                where:{
                    id: entity.id,
                },
            }
        );
        let orderItemModel;
        for (let item of entity.items) {
            
            orderItemModel = await OrderItemModel.findOne({
                where:{ id: item.id}
            });
            
            if(orderItemModel !== null){
                await OrderItemModel.update(
                    {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        product_id: item.productId,
                        quantity: item.quantity
                    },
                    {
                        where: {id: item.id}
                    }
                );
            }

            if(orderItemModel === null){
                await OrderItemModel.create(
                    {
                        order_id: entity.id,
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        product_id: item.productId,
                        quantity: item.quantity
                    }
                );
            }
        }
    }

    async find(id: string): Promise<Order> {
        let orderModel;
        try{
            orderModel = await OrderModel.findOne({
                where:{ id: id },
                rejectOnEmpty: true,
                include: [{model: OrderItemModel}],
            });
        }catch(error){
            throw new Error("Order not found");
        }

        let itemList = [];
        itemList = orderModel.items.map(item =>{ return new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)});
        
        // for (let item of orderModel.items) {
        //     itemList.push( new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity) );
        // }

        const order = new Order(orderModel.id, orderModel.customer_id, itemList);

        return order;
    }

    /**
     * @throws {Error}
     * @return Order[]
     */
    async findAll(): Promise<Order[] | Error>  {
        let ordersModel;
        try{
            ordersModel = await OrderModel.findAll({include: [{model: OrderItemModel}] });
            let orders = [];

            orders = ordersModel.map((orderModel) => {
                let orderItemList = [];

                orderItemList = orderModel.items.map((item) => {
                    return new OrderItem(item.id, item.name, item.price, item.product_id,item.quantity);
                })


                return new Order(orderModel.id, orderModel.customer_id, orderItemList);
            });

            return orders;
        }catch (error) {
            return new Error("Orders not found in database");
        }
    }
}