declare module 'react-native-voice' {
    export interface SpeechResultsEvent {
        value?: string[];
    }

    export interface Voice {
        onSpeechResults: (e: SpeechResultsEvent) => void;
        start: (locale?: string) => Promise<void>;
        stop: () => Promise<void>;
        destroy: () => Promise<void>;
        removeAllListeners: () => void;
    }

    const Voice: Voice;
    export default Voice;
} 