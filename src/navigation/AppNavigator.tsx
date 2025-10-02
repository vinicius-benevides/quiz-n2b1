import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import ThemesScreen from '../screens/ThemesScreen';
import QuestionManagementScreen from '../screens/QuestionManagementScreen';
import QuestionFormScreen from '../screens/QuestionFormScreen';
import QuizSetupScreen from '../screens/QuizSetupScreen';
import QuizPlayScreen from '../screens/QuizPlayScreen';
import QuizSummaryScreen from '../screens/QuizSummaryScreen';
import { palette } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.surface,
    text: palette.text,
    border: palette.border,
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Themes" component={ThemesScreen} />
        <Stack.Screen name="QuestionManagement" component={QuestionManagementScreen} />
        <Stack.Screen name="QuestionForm" component={QuestionFormScreen} />
        <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
        <Stack.Screen name="QuizPlay" component={QuizPlayScreen} />
        <Stack.Screen name="QuizSummary" component={QuizSummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
