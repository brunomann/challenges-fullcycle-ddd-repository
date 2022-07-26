import Product from "../entity/product";
import ProductService from "./productService";

describe("Product service unit test", ()=> {
    it("should change the prices of products", ()=>{

        const product1 = new Product("1", "Leite", 10);
        const product2 = new Product("2", "Leite de Soja", 20);
        const products = [product1, product2];

        ProductService.increasePrice(products, 100);

        expect(product1.price).toBe(20);
        expect(product2.price).toBe(40);

    });
});