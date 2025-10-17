import React from 'react';
import { View, Button, Text } from 'react-native';
import { useGoogleSignIn } from '../src/utils/authHelpers';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const { request, promptAsync } = useGoogleSignIn();
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <Text>Welcome, {user.displayName}</Text>
      ) : (
        <Button
          title="Sign in with Google"
          disabled={!request}
          onPress={() => promptAsync()}
        />
      )}
    </View>
  );
}
