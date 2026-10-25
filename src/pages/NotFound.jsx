import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <main className="not-found-page"><span className="not-found-code">404</span><p className="page-eyebrow">PAGE NOT FOUND</p><h1>This page isn’t in your catalog.</h1><p>It may have moved, or the address may be incorrect.</p><Link className="button button-primary" to="/"><ArrowLeft size={16} /> Back to LetMeGrab</Link></main>
);

export default NotFound;