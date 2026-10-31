import { memo } from "react";
import useQuiz from "../hooks/useQuiz.js";
import styles from "./Quiz.module.css";

// React.memo: only re-renders when the quiz prop changes
function Quiz({ quiz }) {
  const { answers, submitted, score, answeredAll, select, submit, reset } = useQuiz(quiz);

  return (
    <section className="card">
      <div className="section-title">
        <div>
          <div className="eyebrow">QUIZ</div>
          <h2>Test yourself</h2>
        </div>
        {submitted && <div className={styles.score}>{score}/{quiz.length}</div>}
      </div>

      {quiz.map((q, i) => {
        const chosen = answers[i];
        return (
          <div className={styles.question} key={i}>
            <h3>{i + 1}. {q.question}</h3>
            <div className={styles.options}>
              {q.options.map((option, j) => {
                const isCorrect = submitted && j === q.answer;
                const isWrong = submitted && chosen === j && j !== q.answer;
                const cls = [styles.option, isCorrect && styles.correct, isWrong && styles.wrong]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <label className={cls} key={j}>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={chosen === j}
                      onChange={() => select(i, j)}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {submitted && (
              <div className={styles.feedback}>
                {chosen === q.answer ? "✓ Correct" : `✗ Incorrect — correct answer: ${q.options[q.answer]}`}
                {q.explanation && <small>{q.explanation}</small>}
              </div>
            )}
          </div>
        );
      })}

      <div className={styles.actions}>
        {!submitted ? (
          <>
            <button className="primary" onClick={submit} disabled={!answeredAll}>Submit Quiz</button>
            {!answeredAll && <span className={styles.hint}>Answer all {quiz.length} questions to submit</span>}
          </>
        ) : (
          <button className="secondary" onClick={reset}>Try Again</button>
        )}
      </div>
    </section>
  );
}

export default memo(Quiz);
