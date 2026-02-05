 import { useState, useRef, useCallback } from 'react';
 
 interface ActionProtectionOptions {
   /** Minimum delay between actions in ms (default: 500) */
   debounceMs?: number;
   /** Whether to track form submission state (default: true) */
   trackSubmission?: boolean;
 }
 
 interface ActionProtectionReturn {
   /** Whether an action is currently in progress */
   isProcessing: boolean;
   /** Whether the action was recently executed (for debouncing) */
   isDebouncing: boolean;
   /** Whether a form submission is in progress */
   isSubmitting: boolean;
   /** Wrap an action with protection - returns false if blocked */
   protectedAction: <T>(action: () => Promise<T>) => Promise<T | null>;
   /** Mark submission as started */
   startSubmission: () => void;
   /** Mark submission as completed */
   endSubmission: () => void;
   /** Reset all protection states */
   reset: () => void;
 }
 
 /**
  * useActionProtection - Prevents button spamming and duplicate submissions
  * 
  * Usage:
  * const { protectedAction, isProcessing } = useActionProtection();
  * 
  * const handleClick = async () => {
  *   await protectedAction(async () => {
  *     // Your action here
  *   });
  * };
  */
 export const useActionProtection = (
   options: ActionProtectionOptions = {}
 ): ActionProtectionReturn => {
   const { debounceMs = 500, trackSubmission = true } = options;
   
   const [isProcessing, setIsProcessing] = useState(false);
   const [isDebouncing, setIsDebouncing] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   
   const lastActionTime = useRef<number>(0);
   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
 
   const protectedAction = useCallback(async <T>(
     action: () => Promise<T>
   ): Promise<T | null> => {
     const now = Date.now();
     
     // Check if we're within the debounce window
     if (now - lastActionTime.current < debounceMs) {
       console.log('[ActionProtection] Action blocked - debouncing');
       return null;
     }
     
     // Check if already processing
     if (isProcessing) {
       console.log('[ActionProtection] Action blocked - already processing');
       return null;
     }
     
     // Check if form is submitting
     if (trackSubmission && isSubmitting) {
       console.log('[ActionProtection] Action blocked - form submitting');
       return null;
     }
     
     try {
       setIsProcessing(true);
       setIsDebouncing(true);
       lastActionTime.current = now;
       
       const result = await action();
       
       return result;
     } finally {
       setIsProcessing(false);
       
       // Clear debounce after delay
       if (debounceTimeout.current) {
         clearTimeout(debounceTimeout.current);
       }
       debounceTimeout.current = setTimeout(() => {
         setIsDebouncing(false);
       }, debounceMs);
     }
   }, [debounceMs, isProcessing, isSubmitting, trackSubmission]);
 
   const startSubmission = useCallback(() => {
     setIsSubmitting(true);
   }, []);
 
   const endSubmission = useCallback(() => {
     setIsSubmitting(false);
   }, []);
 
   const reset = useCallback(() => {
     setIsProcessing(false);
     setIsDebouncing(false);
     setIsSubmitting(false);
     lastActionTime.current = 0;
     if (debounceTimeout.current) {
       clearTimeout(debounceTimeout.current);
     }
   }, []);
 
   return {
     isProcessing,
     isDebouncing,
     isSubmitting,
     protectedAction,
     startSubmission,
     endSubmission,
     reset,
   };
 };
 
 export default useActionProtection;