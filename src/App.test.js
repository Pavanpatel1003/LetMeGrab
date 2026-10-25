import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import { loginUser, migrateLegacyData, registerUser } from './services/authService';
import { addSampleCatalog } from './services/sampleCatalog';
import { readCatalog, writeCatalog } from './services/storageService';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

const seedAccount = () => {
  localStorage.setItem('letmegrab:v1:users', JSON.stringify([{
    id: 'test-user',
    fullName: 'Pavan Patel',
    email: 'pavan@example.com',
    passwordSalt: 'test-salt',
    passwordHash: 'test-hash'
  }]));
  localStorage.setItem('letmegrab:v1:session', JSON.stringify({ userId: 'test-user' }));
  localStorage.setItem('letmegrab:v1:catalog:test-user', JSON.stringify({
    products: [],
    categories: [{ id: 'category-1', name: 'Accessories', createdAt: new Date().toISOString() }]
  }));
};

test('registers an account with a password hash and opens the dashboard', async () => {
  render(<App />);

  const publicNavigation = within(await screen.findByRole('navigation', { name: 'Main navigation' }));
  fireEvent.click(publicNavigation.getByRole('link', { name: 'Create account' }));
  fireEvent.change(await screen.findByLabelText('Full name'), { target: { value: 'Sammy Patel' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'sammy@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secure123' } });
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'secure123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

  expect(await screen.findByRole('heading', { name: /Welcome back, Sammy/i })).toBeInTheDocument();
  const users = JSON.parse(localStorage.getItem('letmegrab:v1:users'));
  expect(users[0].passwordHash).toBeTruthy();
  expect(users[0].passwordSalt).toBeTruthy();
  expect(users[0]).not.toHaveProperty('password');
  expect(JSON.parse(localStorage.getItem('letmegrab:v1:session'))).toEqual({ userId: users[0].id });
});

test('creates a product from the editor and keeps footer actions available', async () => {
  seedAccount();
  render(<App />);

  fireEvent.click(await screen.findByRole('link', { name: 'Dashboard' }));
  fireEvent.click(await screen.findByRole('link', { name: 'Products' }));
  const productsHeading = screen.getByRole('heading', { name: 'Products' });
  fireEvent.click(within(productsHeading.closest('section')).getByRole('button', { name: 'Add product' }));

  const modal = within(await screen.findByRole('dialog'));
  expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  const saveButton = modal.getByRole('button', { name: 'Add product' });
  expect(saveButton).toBeVisible();
  fireEvent.change(modal.getByLabelText(/Product name/), { target: { value: 'Canvas tote' } });
  fireEvent.change(modal.getByLabelText(/Category/), { target: { value: 'category-1' } });
  fireEvent.change(modal.getByLabelText(/Price/), { target: { value: '25' } });
  fireEvent.click(saveButton);

  await waitFor(() => expect(screen.getByRole('heading', { name: 'Canvas tote' })).toBeInTheDocument());
  const catalog = JSON.parse(localStorage.getItem('letmegrab:v1:catalog:test-user'));
  expect(catalog.products[0]).toMatchObject({ name: 'Canvas tote', categoryId: 'category-1', price: 25 });
  expect(localStorage.getItem('products')).toBeNull();
});

test('keeps each account catalog separate and honors Remember Me', async () => {
  const firstUser = await registerUser({ fullName: 'First User', email: 'first@example.com', password: 'password-one' });
  writeCatalog(firstUser.id, { products: [{ id: 'first-product', name: 'First item' }], categories: [] });
  await loginUser({ email: firstUser.email, password: 'password-one', remember: false });

  expect(localStorage.getItem('letmegrab:v1:session')).toBeNull();
  expect(JSON.parse(sessionStorage.getItem('letmegrab:v1:session:temporary'))).toEqual({ userId: firstUser.id });

  const secondUser = await registerUser({ fullName: 'Second User', email: 'second@example.com', password: 'password-two' });
  expect(readCatalog(secondUser.id)).toEqual({ products: [], categories: [] });
  expect(readCatalog(firstUser.id).products[0].name).toBe('First item');
});

test('migrates the prototype account without retaining plaintext passwords', async () => {
  localStorage.setItem('users', JSON.stringify([{ username: 'Old Name', email: 'old@example.com', password: 'old-password' }]));
  localStorage.setItem('loggedInUser', JSON.stringify({ username: 'Old Name', email: 'old@example.com', password: 'old-password' }));
  localStorage.setItem('products', JSON.stringify([{ title: 'Old product', category: 'Old category', price: '12' }]));

  await migrateLegacyData();

  const users = JSON.parse(localStorage.getItem('letmegrab:v1:users'));
  expect(users[0]).toMatchObject({ fullName: 'Old Name', email: 'old@example.com' });
  expect(users[0].passwordHash).toBeTruthy();
  expect(users[0].password).toBeUndefined();
  expect(localStorage.getItem('users')).toBeNull();
  expect(localStorage.getItem('loggedInUser')).toBeNull();
  expect(readCatalog(users[0].id).products[0]).toMatchObject({ name: 'Old product', price: 12 });
});

test('reassigns products before deleting a populated category', async () => {
  seedAccount();
  const catalogKey = 'letmegrab:v1:catalog:test-user';
  localStorage.setItem(catalogKey, JSON.stringify({
    categories: [
      { id: 'category-1', name: 'Accessories', createdAt: new Date().toISOString() },
      { id: 'category-2', name: 'Travel', createdAt: new Date().toISOString() }
    ],
    products: [{ id: 'product-1', name: 'Canvas tote', categoryId: 'category-1', price: 25, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  }));
  render(<App />);

  fireEvent.click(await screen.findByRole('link', { name: 'Dashboard' }));
  fireEvent.click(await screen.findByRole('link', { name: 'Categories' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete Accessories' }));
  expect(await screen.findByRole('alertdialog', { name: /Move products before deleting/i })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Move products to'), { target: { value: 'category-2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reassign & delete' }));

  await waitFor(() => expect(JSON.parse(localStorage.getItem(catalogKey)).products[0].categoryId).toBe('category-2'));
  expect(JSON.parse(localStorage.getItem(catalogKey)).categories).toHaveLength(1);
});

test('loads five immutable example products and categories without duplicates', async () => {
  seedAccount();
  render(<App />);
  fireEvent.click(await screen.findByRole('link', { name: 'Dashboard' }));
  expect(await screen.findByRole('button', { name: 'Load sample catalog' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Load sample catalog' }));
  await screen.findByRole('heading', { name: 'Hand-poured Soy Candle' });
  const seeded = readCatalog('test-user');
  expect(seeded.categories).toHaveLength(6);
  expect(seeded.categories.some(category => category.name === 'Accessories')).toBe(true);
  expect(seeded.products).toHaveLength(5);
  expect(seeded.products.every(product => product.isSample)).toBe(true);
  expect(seeded.products.every(product => product.image)).toBe(true);
  expect(addSampleCatalog(seeded).addedProducts).toBe(0);
  const oldSamples = { ...seeded, products: seeded.products.map(({ image, ...product }) => product) };
  expect(addSampleCatalog(oldSamples).updatedProducts).toBe(5);
  fireEvent.click(screen.getByRole('link', { name: 'Products' }));
  expect(await screen.findByRole('heading', { name: 'Fresh Apples' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Edit Fresh Apples' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete Fresh Apples' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Categories' }));
  expect(await screen.findAllByText('EXAMPLE')).toHaveLength(5);
  expect(screen.queryByRole('button', { name: 'Rename Grocery Stores' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete Grocery Stores' })).not.toBeInTheDocument();
});
