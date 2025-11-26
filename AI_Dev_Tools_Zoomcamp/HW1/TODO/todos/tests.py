from django.test import TestCase
from django.urls import reverse

from .models import Todo


class TodoTests(TestCase):

    def test_create_todo(self):
        response = self.client.post(reverse('todo_create'), {
            'title': 'Test Task',
            'description': 'Test description',
            'due_date': '2025-12-31',
        })
        self.assertEqual(response.status_code, 302)  # redirect
        self.assertEqual(Todo.objects.count(), 1)
        todo = Todo.objects.first()
        self.assertEqual(todo.title, 'Test Task')

    def test_toggle_resolved(self):
        todo = Todo.objects.create(title='Task')
        url = reverse('todo_toggle_resolved', args=[todo.pk])

        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)

        todo.refresh_from_db()
        self.assertTrue(todo.is_resolved)

    def test_list_page(self):
        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home.html')
