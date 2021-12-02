import React, { useContext, useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';
import { SignInSocialButton } from '../../components/SignInSocialButton';
import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SignTItle,
  Footer,
  FooterWrapper,
} from './styles';

import { useAuth } from '../../hooks/auth';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { useTheme } from 'styled-components';
export function SignIn() {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleSiginWithGoogle = async () => {
    try {
      setIsLoading(true);
      return await signInWithGoogle();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao realizar o login');
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleSiginWithApple = async () => {
    try {
      setIsLoading(true);
      return await signInWithApple();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao realizar o login');
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg width={RFValue(120)} height={RFValue(68)} />
          <Title>
            Controle suas{'\n'}finanças de forma{'\n'}muito simples.
          </Title>
        </TitleWrapper>
        <SignTItle>Faça seu login com{'\n'}uma das contas abaixo.</SignTItle>
      </Header>
      <Footer>
        <FooterWrapper>
          <SignInSocialButton
            onPress={handleSiginWithGoogle}
            title='Entrar com Google'
            svg={GoogleSvg}
          />
          {Platform.OS === 'android' && (
            <SignInSocialButton
              onPress={handleSiginWithApple}
              title='Entrar com Apple'
              svg={AppleSvg}
            />
          )}
          {isLoading && (
            <ActivityIndicator
              color={theme.colors.shape}
              style={{ marginTop: 18 }}
            />
          )}
        </FooterWrapper>
      </Footer>
    </Container>
  );
}
