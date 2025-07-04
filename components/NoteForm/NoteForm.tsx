import { useMutation, useQueryClient } from "@tanstack/react-query";
import css from "./NoteForm.module.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createNote } from "../../lib/api";
import type { Note, NewNoteData } from "../../types/note";
import { toast } from "react-toastify";

interface NoteFormProps {
  onClose: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Must be at least 3 symbols")
    .max(50, "Title too long")
    .required("Title is required"),
  content: Yup.string().max(500, "Max length is 500 characters"),
  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag")
    .required("Tag is required"),
});

export const NoteForm = ({ onClose }: NoteFormProps) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<Note, Error, NewNoteData>({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onClose();
    },
  });
  return (
    <Formik
      initialValues={{ title: "", content: "", tag: "Todo" }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await mutation.mutateAsync({
            title: values.title,
            content: values.content,
            tag: values.tag,
          });
          toast.success("The Note was successfully created!");
        } catch (error) {
          console.log(error);
          toast.error("An Error while creating your Note");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" type="text" name="title" className={css.input} />
            <ErrorMessage component="span" name="title" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows="8"
              className={css.textarea}
            />
            <ErrorMessage
              component="span"
              name="content"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={css.select}>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage component="span" name="tag" className={css.error} />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting}
            >
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
