import React, { Component } from 'react';
import { Alert, Keyboard, ActivityIndicator, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  ExcludeButton,
  ExcludeButtonText,
} from './styles';

import api from '../../services/api';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    this.setState({ loading: true });

    const { users, newUser } = this.state;

    if (users.find(x => x.login === newUser)) {
      ToastAndroid.show('Usuário existente', ToastAndroid.SHORT);
      this.setState({ loading: false, newUser: '' });
      Keyboard.dismiss();
      return;
    }

    const response = await api.get(`/users/${newUser}`);
    const data = {
      name: response.data.name,
      login: response.data.login,
      bio: response.data.bio,
      avatar: response.data.avatar_url,
    };

    this.setState({
      users: [...users, data],
      newUser: '',
      loading: false,
    });

    Keyboard.dismiss();
  };

  handleDeleteUser = async name => {
    Alert.alert(
      'Exclusão',
      'Tem certeza que deseja excluir o usuário?',
      [
        {
          text: 'Não',
        },
        {
          text: 'Sim',
          onPress: () => this.delete(name),
        },
      ],
      { cancelable: false }
    );
  };

  delete = name => {
    const { users } = this.state;

    const newUsers = users.filter(x => x.name !== name);

    AsyncStorage.setItem('users', JSON.stringify(newUsers));

    ToastAndroid.show('Usuário deletado', ToastAndroid.SHORT);

    this.setState({ users: newUsers });
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  render() {
    const { users, newUser, loading } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name ? item.name : 'Sem nome'}</Name>
              <Bio>{item.bio ? item.bio : 'Sem bio'}</Bio>
              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver perfil</ProfileButtonText>
              </ProfileButton>

              <ExcludeButton
                onPress={() => {
                  this.handleDeleteUser(item.name);
                }}
              >
                <ExcludeButtonText>Excluir</ExcludeButtonText>
              </ExcludeButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
