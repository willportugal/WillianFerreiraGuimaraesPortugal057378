import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('deve renderizar com texto correto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando disabled=true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve mostrar loading spinner quando isLoading=true', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('deve aplicar classes de variante primary por padrão', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
  });

  it('deve aplicar classes de variante secondary', () => {
    render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });

  it('deve aplicar classes de variante danger', () => {
    render(<Button variant="danger">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('deve aplicar classes de tamanho sm', () => {
    render(<Button size="sm">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5');
  });

  it('deve aplicar classes de tamanho lg', () => {
    render(<Button size="lg">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
  });
});
