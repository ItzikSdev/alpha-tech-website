import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

function LangConsumer() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="translated">{t('nav.login')}</span>
      <span data-testid="missing">{t('nonexistent.key')}</span>
      <button onClick={() => setLang('en')}>EN</button>
      <button onClick={() => setLang('ru')}>RU</button>
      <button onClick={() => setLang('he')}>HE</button>
    </div>
  );
}

describe('LanguageContext', () => {
  it('defaults to Hebrew', () => {
    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('lang')).toHaveTextContent('he');
  });

  it('translates keys in Hebrew', () => {
    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('translated')).toHaveTextContent('כניסה');
  });

  it('switches to English', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    await user.click(screen.getByText('EN'));

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('translated')).toHaveTextContent('Sign In');
  });

  it('switches to Russian', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    await user.click(screen.getByText('RU'));

    expect(screen.getByTestId('lang')).toHaveTextContent('ru');
  });

  it('returns key when translation missing', () => {
    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.key');
  });

  it('persists language to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    await user.click(screen.getByText('EN'));

    expect(localStorage.getItem('alphacar-lang')).toBe('en');
  });

  it('reads saved language from localStorage', () => {
    localStorage.setItem('alphacar-lang', 'en');

    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });

  it('sets RTL direction for Hebrew', () => {
    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('he');
  });

  it('sets LTR direction for English', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LangConsumer />
      </LanguageProvider>,
    );

    await user.click(screen.getByText('EN'));

    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('throws when useLanguage used outside provider', () => {
    expect(() => {
      render(<LangConsumer />);
    }).toThrow('useLanguage must be used within LanguageProvider');
  });
});
