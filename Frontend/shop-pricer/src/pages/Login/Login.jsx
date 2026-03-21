import "./Login.css";
export default function Login(){
    return (
        <>
            <div className="min-h-screen">
                <div className="mx-auto mt-40 border max-w-lg py-8 px-8">
                    <div className="flex flex-col mb-5">
                        <p className="uppercase mb-2 font-bold mx-auto">Login</p>
                        <p className="mx-auto">Please enter your email and password</p>
                    </div>
                    <div className="flex flex-col gap-4 mb-5">
                        <input className="px-2 py-2 border" type="email" />
                        <input className="border px-2 py-2" type="password" />
                        <button className="mx-auto mb-5">Forgot Password?</button>
                    </div>
                    <div className="mb-3">
                        <button className="mx-auto border rounded-xl py-2 px-2 mb-2">
                            Login
                        </button>
                        <p className="mx-auto w-fit">Dont have an account?<span>Sign up</span></p>
                    </div>
                </div>
            </div>
        </>
    );
}