import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/core';
import React, { useCallback, useState } from 'react';
import { HighlightCard } from '../../components/HighlightCard';
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard';
import { ActivityIndicator } from 'react-native';
import {
  Container,
  Header,
  UserInfo,
  Potho,
  User,
  UserGreting,
  UserName,
  UserWrapper,
  Icon,
  HighlightCards,
  Transaction,
  Title,
  TransactionsList,
  LogoutButton,
  LoadContainer,
} from './styles';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HiligthData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [hiligthData, setHiligthData] = useState<HiligthData>(
    {} as HiligthData
  );
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const { sigOut, user } = useAuth();

  async function loadTransactions() {
    const collectionKey = `@gofinance:transactions_user:${user.id}`;

    const response = await AsyncStorage.getItem(collectionKey);

    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const getLastTransactionDate = (
      collection: DataListProps[],
      type: 'positive' | 'negative'
    ) => {
      const collectionFiltered = collection.filter(
        (transaction) => transaction.type === type
      );

      if (collectionFiltered.length === 0) {
        return 0;
      }

      const lasTransaction = new Date(
        Math.max.apply(
          Math,
          collectionFiltered.map((transaction) =>
            new Date(transaction.date).getTime()
          )
        )
      );

      const lasTransactionFormated = `${lasTransaction.getDate()} de ${lasTransaction.toLocaleString(
        'pt-BR',
        { month: 'long' }
      )}`;

      return lasTransactionFormated;
    };

    const transcationsFormatted: DataListProps[] = transactions.map(
      (transaction: DataListProps) => {
        if (transaction.type === 'positive') {
          entriesTotal += Number(transaction.amount);
        } else {
          expensiveTotal += Number(transaction.amount);
        }

        const amount = Number(transaction.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(transaction.date));
        return {
          id: transaction.id,
          name: transaction.name,
          type: transaction.type,
          category: transaction.category,
          date,
          amount,
        };
      }
    );
    const lastTransactionEntries = getLastTransactionDate(
      transactions,
      'positive'
    );

    const lastTransactionExpensives = getLastTransactionDate(
      transactions,
      'negative'
    );

    const totalInterval =
      lastTransactionEntries === 0
        ? 'Não tem transaçào'
        : `01 a ${lastTransactionEntries}`;

    const total = entriesTotal - expensiveTotal;
    setHiligthData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction:
          lastTransactionEntries === 0
            ? 'Não tem transaçào'
            : `Ultima entrada dia ${lastTransactionEntries} `,
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction:
          lastTransactionEntries === 0
            ? 'Não tem transaçào'
            : `Ultima saída dia ${lastTransactionExpensives}`,
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: totalInterval,
      },
    });
    setTransactions(transcationsFormatted);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );
  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size='large' />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Potho source={{ uri: user.picture }} />
                <User>
                  <UserGreting>Ola,</UserGreting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={sigOut}>
                <Icon name='power' />
              </LogoutButton>
            </UserWrapper>
          </Header>
          <HighlightCards>
            <HighlightCard
              title='Entradas'
              amount={hiligthData.entries.amount}
              lastTransaction={hiligthData.entries.lastTransaction}
              type='up'
            />
            <HighlightCard
              title='Saídas'
              amount={hiligthData.expensives.amount}
              lastTransaction={hiligthData.expensives.lastTransaction}
              type='down'
            />
            <HighlightCard
              title='Total'
              amount={hiligthData.total.amount}
              lastTransaction={hiligthData.total.lastTransaction}
              type='total'
            />
          </HighlightCards>
          <Transaction>
            <Title>Listagem</Title>
            <TransactionsList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            ></TransactionsList>
          </Transaction>
        </>
      )}
    </Container>
  );
}
