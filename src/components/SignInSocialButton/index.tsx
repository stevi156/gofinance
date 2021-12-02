import React from 'react';

import { Container, ImageContainer, Text } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
import { SvgProps } from 'react-native-svg';
interface Props extends RectButtonProps {
  title: string;
  svg: React.FC<SvgProps>;
}

export function SignInSocialButton({ svg: Svg, title, ...rest }: Props) {
  return (
    <Container {...rest}>
      <ImageContainer>
        <Svg />
      </ImageContainer>
      <Text>{title}</Text>
    </Container>
  );
}
