"""
Entry point for AnimeLog Backend
"""
from app import create_app, db
from app.models import User, Anime, Review, Comment, WatchList

app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Anime': Anime,
        'Review': Review,
        'Comment': Comment,
        'WatchList': WatchList
    }


if __name__ == '__main__':
    app.run(debug=True, port=5000)
