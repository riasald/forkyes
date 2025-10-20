declare module 'react-native-deck-swiper' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface SwiperProps {
    cards: any[];
    renderCard: (card: any, index: number) => JSX.Element;
    onSwiped?: (index: number) => void;
    onSwipedAll?: () => void;
    onSwipedRight?: (index: number) => void;
    onSwipedLeft?: (index: number) => void;
    stackSize?: number;
    cardIndex?: number;
    backgroundColor?: string;
    stackSeparation?: number;
    useViewOverflow?: boolean;
    verticalSwipe?: boolean;
    horizontalSwipe?: boolean;
    overlayLabels?: Record<string, any>;
    cardStyle?: ViewStyle;
  }

  export default class Swiper extends Component<SwiperProps> {}
}
