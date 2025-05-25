const Header: React.FC<{
  title: string;
  description: string;
  date?: string;
}> = ({ title, description, date }) => {
  return (
    <div className="relative flex">
      <div className="absolute -left-16 aspect-square h-full w-fit rounded-full bg-accent" />

      <div className="z-10 py-8">
        <div className="my-1 flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <span className="opacity-50">{date}</span>
        </div>

        <div className="text-justify">{description}</div>
      </div>
    </div>
  );
};

export default Header;
