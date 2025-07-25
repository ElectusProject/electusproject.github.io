import React, { ReactNode } from 'react';
import background from '../../assets/svg/background.svg'
import Banner from '../logo/Banner';

interface StyledBackgroundProps {
    children?: ReactNode;
    className?: string;
}

const StyledBackground: React.FC<StyledBackgroundProps> = ({ children, className = '' }) => {
    return (
        <>
            <div
                className={`${className}`}
                style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '100vh',
                    // padding: '40px'
                }}
            >
                <Banner />
                <div className='pt-[60px] flex flex-col'>
                    {children}
                </div>
                
            </div>
        </>

    );
};

export default StyledBackground;
