// Custom hook: all quiz logic (answers, submit, score, reset) in one place
import { useCallback, useMemo, useState } from "react";

export default function useQuiz(quiz) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const select = useCallback(
    (questionIndex, optionIndex) => {
      if (submitted) return;
      setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    },
    [submitted]
  );

  const score = useMemo(
    () => quiz.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0),
    [quiz, answers]
  );

  const answeredAll = Object.keys(answers).length === quiz.length;

  const submit = useCallback(() => setSubmitted(true), []);
  const reset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
  }, []);

  return { answers, submitted, score, answeredAll, select, submit, reset };
}
