import ShoppingList from "./ShoppingList/ShoppingList";

export default function SearchPage({cart, setCart}){
    return (
        <ShoppingList cart={cart} setCart={setCart}/>
    );
}