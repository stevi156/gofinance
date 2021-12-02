import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryCar } from '../../components/HistoryCar';
import { VictoryPie } from 'victory-native';
import {
  Container,
  Header,
  Title,
  Content,
  ChatContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
} from './styles';
import { categories } from '../../utils/categories';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { addMonths, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadContainer } from '../Dashboard/styles';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { useAuth } from '../../hooks/auth';

interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface TotalByCategoryProps {
  name: string;
  total: number;
  totalFormatted: string;
  percent: string;
  color: string;
}

export function Resume() {
  const [totalByCategories, setTotalByCategories] = useState<
    TotalByCategoryProps[]
  >([]);

  const [selectDate, setSelectDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const theme = useTheme();

  const handleChangeDate = useCallback(
    (action: 'next' | 'prev') => {
      if (action === 'next') {
        const newDate = addMonths(selectDate, 1);
        setSelectDate(newDate);
      } else {
        const newDate = subMonths(selectDate, 1);
        setSelectDate(newDate);
      }
    },
    [selectDate]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const collectionKey = `@gofinance:transactions_user:${user.id}`;

    const response = await AsyncStorage.getItem(collectionKey);

    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter(
      (expensive: TransactionData) =>
        expensive.type === 'negative' &&
        new Date(expensive.date).getMonth() === selectDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectDate.getFullYear()
    );

    const expensivesTotal = expensives.reduce(
      (acumulator: number, currentValue: TransactionData) => {
        return acumulator + Number(currentValue.amount);
      },
      0
    );

    const totalByCategory = [] as TotalByCategoryProps[];

    categories.forEach((category) => {
      let categorySum = 0;

      expensives.forEach((expensive: TransactionData) => {
        if (category.name === expensive.category) {
          categorySum += Number(expensive.amount);
        }
      });
      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const percent = `${((categorySum / expensivesTotal) * 100).toFixed(
          2
        )}%`;

        totalByCategory.push({
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted,
          percent,
        });
      }
    });
    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }, [selectDate, totalByCategories]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectDate])
  );

  return (
    <Container>
      <Header>
        <Title>Resulmo por categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size='large' />
        </LoadContainer>
      ) : (
        <>
          <MonthSelect>
            <MonthSelectButton onPress={() => handleChangeDate('prev')}>
              <MonthSelectIcon name='chevron-left' />
            </MonthSelectButton>
            <Month>{format(selectDate, 'MMMM ,yyyy', { locale: ptBR })}</Month>
            <MonthSelectButton onPress={() => handleChangeDate('next')}>
              <MonthSelectIcon name='chevron-right' />
            </MonthSelectButton>
          </MonthSelect>

          <ChatContainer>
            <VictoryPie
              data={totalByCategories}
              x='percent'
              y='total'
              colorScale={totalByCategories.map((category) => category.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.shape,
                },
              }}
              labelRadius={50}
            />
          </ChatContainer>
          <Content
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: useBottomTabBarHeight(),
            }}
          >
            {totalByCategories.map((totalByCategory) => (
              <HistoryCar
                key={totalByCategory.name}
                title={totalByCategory.name}
                amount={totalByCategory.totalFormatted}
                color={totalByCategory.color}
              />
            ))}
          </Content>
        </>
      )}
    </Container>
  );
}
