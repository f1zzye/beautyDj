### 🎀 Mood Beauty

## Stack:

- [Python](https://www.python.org/downloads/)
- [Docker](https://www.docker.com/)
- [Django](https://www.djangoproject.com/)

## Local Developing

All actions should be executed from the source directory of the project and only after installing all requirements.

1. Firstly, create and activate a new virtual environment:
   ```bash
   python3.12 -m venv ../venv
   source ../venv/bin/activate
   ```
   
2. Install packages:
   ```bash
   poetry update
   poetry install
   ```
   
3. Run project dependencies, migrations, fill the database with the fixture data etc.:
   ```bash
   ./manage.py migrate
   ./manage.py loaddata <path_to_fixture_files> 
   ```
   
## Docker
   ```bash
   docker build .
   
   docker-compose up
   ```

## License

This project uses the [MIT] license(https://github.com/f1zzye/beautyDj/blob/master/LICENSE)

## Contact 

To contact the author of the project, write to email kosenko2401@gmail.com
