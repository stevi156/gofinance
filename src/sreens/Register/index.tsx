import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from 'react-native';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components/forms/Button';
import { CategorySelectButton } from '../../components/forms/CategorySelectButton';
import { InputForm } from '../../components/forms/InputForm';
import { TransactionTypeButton } from '../../components/forms/TransactionTypeButton';
import { CategorySelect } from '../CategorySelect';
import uuid from 'react-native-uuid';
import {
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionsType,
} from './styles';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';

interface NavigationProps {
  navigate: (screen: string) => void;
}

interface FormData {
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name: Yup.string().required('Campo obrigatório'),
  amount: Yup.number()
    .typeError('Informe um valor númerico')
    .positive('O valor não pode ser negativo')
    .required('O valor é obrigatório'),
});

export function Register() {
  const [transactionType, setTransactionType] = useState('');
  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigation = useNavigation<NavigationProps>();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const { user } = useAuth();

  const handleTransactionsTypeSelect = (type: 'positive' | 'negative') => {
    setTransactionType(type);
  };

  const handleSelectCategoryModal = () => {
    setCategoryModalOpen(!categoryModalOpen);
  };

  const handleRegister = async (form: FormData) => {
    if (!transactionType) {
      Alert.alert('Selecione o tipo de transação');
      return;
    }

    if (category.key === 'category') {
      Alert.alert('Selecione a categoria');
      return;
    }
    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.name,
      date: new Date(),
    };
    try {
      const collectionKey = `@gofinance:transactions_user:${user.id}`;

      const data = await AsyncStorage.getItem(collectionKey);
      const currentData = data ? JSON.parse(data) : [];
      const dataFormatted = [...currentData, newTransaction];
      await AsyncStorage.setItem(collectionKey, JSON.stringify(dataFormatted));
      reset();
      setTransactionType('');

      setCategory({
        key: 'category',
        name: 'Categoria',
      });

      navigation.navigate('Listagem');
    } catch (err) {
      console.log(err);
      Alert.alert('Erro ao cadastrar transação');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>
        <Fields>
          <Form>
            <InputForm
              control={control}
              name='name'
              placeholder='Nome'
              autoCapitalize='sentences'
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />
            <InputForm
              control={control}
              name='amount'
              placeholder='Preço'
              keyboardType='numeric'
              error={errors.amount && errors.amount.message}
            />
            <TransactionsType>
              <TransactionTypeButton
                isActive={transactionType === 'positive'}
                type='positive'
                title='Income'
                onPress={() => handleTransactionsTypeSelect('positive')}
              />
              <TransactionTypeButton
                isActive={transactionType === 'negative'}
                type='negative'
                title='Outcome'
                onPress={() => handleTransactionsTypeSelect('negative')}
              />
            </TransactionsType>
            <CategorySelectButton
              onPress={handleSelectCategoryModal}
              title={category.name}
            />
          </Form>
          <Button title='Enviar' onPress={handleSubmit(handleRegister)} />
        </Fields>
        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
