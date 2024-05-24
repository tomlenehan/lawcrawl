def clear_highlights(self, conversation):
    file_path = os.path.join(settings.TMP_DIR, conversation.temp_file)
    doc = fitz.open(file_path)
    # Clear the highlights
    for page in doc:
        # Remove the annotations (highlights are a type of annotation)
        doc.xref_set_key(page.xref, "Annots", "null")

    doc.save(file_path, incremental=1, encryption=0)
    doc.close()
    return file_path

def fuzzy_highlight(self, conversation, query):
    file_path = os.path.join(settings.TMP_DIR, conversation.temp_file)

    try:
        doc = fitz.open(file_path)
        highlight_limit = doc.page_count

        # user_message = get_latest_user_message(conversation)
        user_message = query

        # get relevant chunks for highlighting
        processor = DocumentProcessor(conversation.case.uid)
        vectorstore = processor.get_vector_store()
        highlight_texts = vectorstore.similarity_search_with_score(
            user_message, k=highlight_limit, filter=processor.filter_query
        )

        # sort by score
        highlight_texts = sorted(
            [
                doc_and_score
                for doc_and_score in highlight_texts
                if doc_and_score[1] >= 0.75
            ],
            key=lambda x: x[1],
            reverse=True,
        )[:highlight_limit]

        for highlight_text in highlight_texts:
            cleaned_text = highlight_text[0].page_content

            for page in doc:
                # for page in docs:
                page_text = page.get_text("text")

                # Calculate similarity score
                similarity = fuzz.partial_ratio(page_text, cleaned_text)

                if similarity > 80:
                    areas = page.search_for(cleaned_text)

                    # If it fails to match exactly, split cleaned
                    # text into segments and search for each segment
                    if not areas:
                        bounding_rects = []
                        # Split the cleaned text into segments based on newline characters
                        segments = cleaned_text.split("\n")
                        # Iterate through each segment and search for areas
                        for segment in segments:
                            areas = page.search_for(segment)
                            if areas:
                                # Create a bounding rect around all areas for this segment
                                bounding_rect = fitz.Rect(areas[0])
                                for area in areas[1:]:
                                    bounding_rect.include_rect(area)

                                bounding_rects.append(bounding_rect)

                        # Create a single highlight annotation for the bounding rects of all segments
                        if bounding_rects:
                            bounding_rect = bounding_rects[0]
                            for rect in bounding_rects[1:]:
                                bounding_rect.include_rect(rect)

                            highlight = page.add_highlight_annot(bounding_rect)
                            highlight.set_colors({"stroke": (1.0, 1.0, 0.553)})
                            highlight.update()
                    else:
                        # Create a highlight annotation for the entire cleaned_text
                        bounding_rect = fitz.Rect(areas[0])
                        for area in areas[1:]:
                            bounding_rect.include_rect(area)

                        highlight = page.add_highlight_annot(bounding_rect)
                        highlight.set_colors({"stroke": (1.0, 1.0, 0.553)})
                        highlight.update()

        doc.save(file_path, incremental=1, encryption=0)
        return doc

    except Exception as e:
        return False, f"Error highlighting text: {e}"