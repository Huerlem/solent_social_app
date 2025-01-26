export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const user = await login(email, password);
      Cookies.set('token', user.token); 
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Error Logging In');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="bg-white w-[300px] p-6 rounded shadow">
        <h2 className="text-center text-xl mb-6">LOGIN</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              {...register('email', { required: true })}
              className="w-full h-8 px-2 bg-purple-50 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full h-8 px-2 bg-purple-50 rounded"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded h-8 mt-2"
          >
            {isLoading ? "Loading..." : "Login"}
          </button>

          <p className="text-center text-sm">
            Need to Create an Account?{" "}
            <Link href="/register" className="text-purple-600">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
