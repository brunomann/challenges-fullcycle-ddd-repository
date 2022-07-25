import Address from "../../domain/entity/address";
import Customer from "../../domain/entity/customer";
import Product from "../../domain/entity/product";
import CustomerRepositoryInterface from "../../domain/repository/customerRepositoryInterface";
import CustomerModel from "../db/sequelize/model/customerModel";
import ProductModel from "../db/sequelize/model/productModel";

export default class CustomerRepository implements CustomerRepositoryInterface
{
    async create(entity: Customer): Promise<void> {
        await CustomerModel.create({
            id: entity.id,
            name: entity.name,
            street: entity.address.street,
            number: entity.address.number,
            zipCode: entity.address.zip,
            city: entity.address.city,
            active: entity.isActive(),
            rewardPoints: entity.rewardPoints
        });
    }
    
    async update(entity: Customer): Promise<void> {
        await CustomerModel.update(
            {
                name: entity.name,
                street: entity.address.street,
                number: entity.address.number,
                zipcode: entity.address.zip,
                city: entity.address.city,
                active: entity.isActive(),
                rewardPoints: entity.rewardPoints
            },
            {
                where:{
                    id: entity.id,
                }
            });
    }

    async find(id: string): Promise<Customer> {
        let customerModel;
        try{
            customerModel = await CustomerModel.findOne({
                where:{ id },
                rejectOnEmpty: true
            });
        }catch(error){
            throw new Error("Customer not found");
        }

        const customer = new Customer(customerModel.id, customerModel.name);
        const address = new Address(customerModel.street, customerModel.number, customerModel.zipCode, customerModel.city);
        customer.changeAddress(address);
        return customer;
    }

    async findAll(): Promise<Customer[]> {
        const customerModels = await CustomerModel.findAll();
        const customers = customerModels.map((customerModel) => {
            let customer = new Customer(customerModel.id, customerModel.name);
            customer.changeAddress(new Address(customerModel.street, customerModel.number, customerModel.zipCode, customerModel.city));
            customer.addRewardPoints(customerModel.rewardPoints);
            if(customerModel.active){
                customer.isActive();
            }

            return customer;
        });

        return customers;
    }

}