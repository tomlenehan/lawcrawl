from django.test import SimpleTestCase

from main.ai_prompts import (
    CHAT_QA_PROMPT,
    INITIAL_REVIEW_USER_MESSAGE,
    SUMMARY_QA_PROMPT,
    SUMMARY_REVIEW_QUESTION,
    build_chat_history_pairs,
)


class AIPromptTests(SimpleTestCase):
    def test_summary_prompt_preserves_frontend_markers(self):
        rendered = SUMMARY_QA_PROMPT.format(
            context="Page 2: The agreement renews automatically unless notice is given.",
            question=SUMMARY_REVIEW_QUESTION,
        )

        self.assertIn("[[Page X]]", rendered)
        self.assertIn("{{75%}}", rendered)
        self.assertIn("## Priority Issues", rendered)

    def test_chat_prompt_keeps_document_grounding_rules(self):
        rendered = CHAT_QA_PROMPT.format(
            context="Page 4: Either party may terminate on 30 days notice.",
            question="Can either party terminate?",
        )

        self.assertIn("using only the document excerpts", rendered)
        self.assertIn("[[Page X]]", rendered)
        self.assertIn("If you cannot answer from the excerpts", rendered)

    def test_chat_history_skips_legacy_internal_prompts(self):
        conversation = [
            {
                "role": "user",
                "content": "You are an excellent in-house lawyer. SECTIONS OF INTEREST:",
            },
            {"role": "agent", "content": "Legacy upload summary."},
            {"role": "user", "content": "What happens if renewal notice is late?"},
            {"role": "agent", "content": "The renewal notice is discussed on [[Page 2]]."},
        ]

        self.assertEqual(
            build_chat_history_pairs(conversation),
            [
                (
                    "What happens if renewal notice is late?",
                    "The renewal notice is discussed on [[Page 2]].",
                )
            ],
        )

    def test_chat_history_keeps_initial_review_and_recent_pairs(self):
        conversation = [
            {"role": "user", "content": INITIAL_REVIEW_USER_MESSAGE},
            {"role": "agent", "content": "Initial summary."},
        ]
        for index in range(6):
            conversation.extend(
                [
                    {"role": "user", "content": f"Question {index}"},
                    {"role": "agent", "content": f"Answer {index}"},
                ]
            )

        self.assertEqual(
            build_chat_history_pairs(conversation),
            [
                ("Question 2", "Answer 2"),
                ("Question 3", "Answer 3"),
                ("Question 4", "Answer 4"),
                ("Question 5", "Answer 5"),
            ],
        )
