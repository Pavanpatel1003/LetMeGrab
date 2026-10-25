import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';

const PublicLayout = () => (
    <>
        <PublicHeader />
        <Outlet />
    </>
);

export default PublicLayout;