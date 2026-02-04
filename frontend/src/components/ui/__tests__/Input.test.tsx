import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  it('deve renderizar input básico', () => {
    render(<Input placeholder="Digite algo" />);
    expect(screen.getByPlaceholderText('Digite algo')).toBeInTheDocument();
  });

  it('deve renderizar com label', () => {
    render(<Input label="Nome" />);
    expect(screen.getByText('Nome')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro', () => {
    render(<Input error="Campo obrigatório" />);
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Campo obrigatório')).toHaveClass('text-red-600');
  });

  it('deve mostrar texto de ajuda', () => {
    render(<Input helperText="Mínimo 3 caracteres" />);
    expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
  });

  it('não deve mostrar helperText quando há erro', () => {
    render(<Input error="Erro" helperText="Ajuda" />);
    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.queryByText('Ajuda')).not.toBeInTheDocument();
  });

  it('deve aplicar classes de erro quando há erro', () => {
    render(<Input error="Erro" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('deve chamar onChange quando valor muda', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'teste' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('deve estar desabilitado quando disabled=true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('deve aceitar tipo password', () => {
    render(<Input type="password" placeholder="Senha" />);
    expect(screen.getByPlaceholderText('Senha')).toHaveAttribute('type', 'password');
  });
});
