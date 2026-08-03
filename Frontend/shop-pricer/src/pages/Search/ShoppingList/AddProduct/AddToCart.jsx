import DetailsAdd from "./DetailedAdd";

export default function AddToCart({setCart, showModal, setShowModal}){
    return (
        <div>
            <DetailsAdd setCart={setCart} showModal={showModal} setShowModal={setShowModal} />
        </div>
    );
}