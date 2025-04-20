import React from 'react';



const Hero: React.FC = ({ }) => {
  return (
    <div className="relative h-[100vh] sm:h-[80vh] lg:h-[100vh] flex flex-col w-full items-center justify-start flex-grow">
      <div 
        style={{ 
          backgroundImage: `url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1745160935/burocs_fekaet.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '100%'
        }}
        className='relative cursor-pointer'
      >
        <div className='flex flex-col gap-2 justify-center items-center absolute bottom-2 left-0 right-0 mx-auto'>
          <p className='text-xl tracking-widest text-white'>SHOP ALL</p>
          <div className='flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-darkaccent rounded-full transition-all duration-300 text-black dark:text-textaccent button-grow'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;