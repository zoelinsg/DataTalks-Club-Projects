from datetime import date

from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse

from .models import Todo


def todo_list(request):
    todos = Todo.objects.all().order_by('is_resolved', 'due_date', '-created_at')
    return render(request, 'home.html', {'todos': todos})


def _parse_due_date(due_date_str):
    if not due_date_str:
        return None
    try:
        return date.fromisoformat(due_date_str)  # 期待 YYYY-MM-DD
    except ValueError:
        return None


def todo_create(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        due_date_str = request.POST.get('due_date')
        due_date = _parse_due_date(due_date_str)

        Todo.objects.create(
            title=title,
            description=description,
            due_date=due_date,
        )
        return redirect('todo_list')

    return render(request, 'todo_form.html')


def todo_edit(request, pk):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == 'POST':
        todo.title = request.POST.get('title')
        todo.description = request.POST.get('description', '')
        due_date_str = request.POST.get('due_date')
        todo.due_date = _parse_due_date(due_date_str)
        todo.save()
        return redirect('todo_list')

    return render(request, 'todo_form.html', {'todo': todo})


def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == 'POST':
        todo.delete()
        return redirect('todo_list')

    return render(request, 'todo_confirm_delete.html', {'todo': todo})


def todo_toggle_resolved(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_resolved = not todo.is_resolved
    todo.save()
    return redirect('todo_list')
