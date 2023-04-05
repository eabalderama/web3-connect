import Navbar from './Navbar';
export interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  return (
    <>
      <Navbar />
      <div className="w-screen max-w-5xl mx-auto scroll-smooth mt-20">
        {children}
      </div>
    </>
  );
};

export default Layout;
