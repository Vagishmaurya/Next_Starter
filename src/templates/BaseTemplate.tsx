import { useTranslations } from 'next-intl';
import { AppConfig } from '@/utils/AppConfig';
import { ThemeToggle } from '@/components/theme-toggle';
import styled from 'styled-components';

const TemplateWrapper = styled.div`
  width: 100%;
  padding: 0.25rem;
  color: ${({ theme }) => theme.foreground};
  font-family: ${({ theme }) => theme.fontFamily?.sans || 'inherit'};
  -webkit-font-smoothing: antialiased;
`;

const MaxWidthContainer = styled.div`
  margin: 0 auto;
  max-width: 56rem;
`;

const Header = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-top: 4rem;
  padding-bottom: 2rem;
`;

const TitleContainer = styled.div`
  margin-bottom: 1rem;
`;

const MainTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
`;

const Subtitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.mutedForeground};
  margin: 0;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const Nav = styled.nav`
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    font-size: 1.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;

const RightNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    font-size: 1.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;

const MainContent = styled.main`
  padding: 2rem 0;
`;

const Footer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mutedForeground};
  margin-top: 2rem;
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: underline;
  }
`;

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <TemplateWrapper>
      <MaxWidthContainer>
        <Header>
          <TitleContainer>
            <MainTitle>{AppConfig.name}</MainTitle>
            <Subtitle>{t('description')}</Subtitle>
          </TitleContainer>

          <NavContainer>
            <Nav aria-label="Main navigation">
              {props.leftNav}
            </Nav>

            <RightNav>
              {props.rightNav}
              <ThemeToggle />
            </RightNav>
          </NavContainer>
        </Header>

        <MainContent>{props.children}</MainContent>

        <Footer>
          Made with Next.js and styled-components
        </Footer>
      </MaxWidthContainer>
    </TemplateWrapper>
  );
};
