'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { OAuthButtons } from './OAuthButtons';
import { Button } from '@/components/ui/styled/Button';
import { Input, Label, ErrorMessage } from '@/components/ui/styled/Input';
import { LoadingSpinner } from '@/components/ui/styled/LoadingSpinner';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInInput = z.infer<typeof signInSchema>;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ErrorAlert = styled.div`
  background-color: ${({ theme }) => `${theme.destructive}15`};
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.destructive};
  border: 1px solid ${({ theme }) => theme.destructive};
`;

const LinkText = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

const HelperText = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mutedForeground};
  margin: 0;
`;

const HelperTextContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  justify-content: center;
`;

export const SignInForm = () => {
  const t = useTranslations('SignInForm');
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      setApiError(null);
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      setApiError(message);
    }
  };

  return (
    <FormContainer onSubmit={form.handleSubmit(onSubmit)}>
      {apiError && <ErrorAlert>{apiError}</ErrorAlert>}

      <FormGroup>
        <Label htmlFor="email">{t('email_label')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('email_placeholder')}
          disabled={isLoading}
          error={!!form.formState.errors.email}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <ErrorMessage>{form.formState.errors.email.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">{t('password_label')}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t('password_placeholder')}
          disabled={isLoading}
          error={!!form.formState.errors.password}
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <ErrorMessage>{form.formState.errors.password.message}</ErrorMessage>
        )}
      </FormGroup>

      <Button
        type="submit"
        disabled={form.formState.isSubmitting || isLoading}
        style={{ width: '100%' }}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={16} />
            {t('signing_in')}
          </>
        ) : (
          t('sign_in')
        )}
      </Button>

      <OAuthButtons title="Or continue with" />

      <HelperTextContainer>
        <HelperText>{t('no_account')}</HelperText>
        <LinkText href="/sign-up">{t('sign_up')}</LinkText>
      </HelperTextContainer>
    </FormContainer>
  );
};
