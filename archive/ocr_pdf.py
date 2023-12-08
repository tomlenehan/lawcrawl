# def ocr_pdf(uploaded_file_obj):
#     temp_dir = settings.TMP_DIR
#     if not os.path.exists(temp_dir):
#         os.makedirs(temp_dir)
#
#     file_extension = os.path.splitext(uploaded_file_obj.name)[1]
#     temp_filename = f"{uuid.uuid4()}{file_extension}"
#     temp_file_path = os.path.join(temp_dir, temp_filename)
#
#     try:
#         with open(temp_file_path, "wb+") as temp_file:
#             for chunk in uploaded_file_obj.chunks():
#                 temp_file.write(chunk)
#         if os.path.getsize(temp_file_path) == 0:
#             raise IOError("Written file is empty")
#     except IOError as e:
#         return False, f"Error saving file: {str(e)}"
#
#     unknown_char_threshold = 50
#     perform_ocr = False
#
#     try:
#         doc = fitz.open(temp_file_path)
#
#         if doc.is_repaired:
#             temp_filename = f"repaired_{temp_filename}"
#             temp_file_path = os.path.join(temp_dir, temp_filename)
#             doc.save(temp_file_path, encryption=0)
#
#         loader = PyMuPDFLoader(temp_file_path)
#         docs = loader.load()
#
#         for page_num in range(min(10, len(docs))):
#             page_text = docs[page_num].page_content
#             if page_text.count("�") > unknown_char_threshold:
#                 perform_ocr = True
#                 break
#
#         doc.close()  # Close the document
#
#         if perform_ocr:
#             temp_filename = f"ocr_{temp_filename}"
#             ocred_pdf_path = os.path.join(temp_dir, temp_filename)
#             try:
#                 # If the document is less than 4 pages, force OCR
#                 if len(docs) < 4:
#                     ocrmypdf.ocr(
#                         temp_file_path,
#                         ocred_pdf_path,
#                         force_ocr=True,
#                         language="eng",
#                     )
#                 else:
#                     ocrmypdf.ocr(
#                         temp_file_path,
#                         ocred_pdf_path,
#                         skip_text=True,w\
#                         language="eng",
#                     )
#                 return True, temp_filename
#             except Exception as ocr_error:
#                 return False, f"Error during OCR processing {ocr_error}"
#
#     except RuntimeError as e:
#         return False, f"Error opening file: {str(e)}"
#
#     # If no OCR needed, return True and the original filename
#     return True, temp_filename