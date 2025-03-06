document.addEventListener('DOMContentLoaded', function() {
  // Update current year in the footer
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Helper function to retrieve query parameters (e.g., ?id=1)
  function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }

  const comicId = getQueryParam('id');

  if (!comicId) {
    document.querySelector('.container').innerHTML = '<p>No comic id specified in the URL. Use ?id=1</p>';
  } else {
    fetch('data/comics.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch comics data');
        }
        return response.json();
      })
      .then(data => {
        const comic = data.find(c => c.id === comicId);
        if (!comic) {
          document.querySelector('.container').innerHTML = '<p>Comic not found</p>';
          return;
        }

        // Populate comic details
        document.getElementById('comic-title').textContent = comic.title;
        const coverImage = document.getElementById('cover-image');
        coverImage.src = comic.coverImage;
        coverImage.alt = comic.title + ' cover';
        document.getElementById('comic-info').innerHTML = `
          <p><strong>Author:</strong> ${comic.author}</p>
          <p><strong>Artist:</strong> ${comic.artist}</p>
          <p><strong>Status:</strong> ${comic.status}</p>
          <p><strong>Release Year:</strong> ${comic.releaseYear}</p>
          <p><strong>Genres:</strong> ${comic.genres.join(', ')}</p>
          <p><strong>Description:</strong> ${comic.description}</p>
        `;

        // Pagination for chapters
        const chapters = comic.chapters;
        const itemsPerPage = 10;
        let currentPage = 1;
        const totalPages = Math.ceil(chapters.length / itemsPerPage);

        function renderChapters() {
          const chapterList = document.getElementById('chapterList');
          chapterList.innerHTML = '';
          // Calculate the chapters to display on the current page
          const start = (currentPage - 1) * itemsPerPage;
          const end = start + itemsPerPage;
          const chaptersToShow = chapters.slice(start, end);
          chaptersToShow.forEach((chapter, index) => {
            // Create a chapter card
            const chapterCard = document.createElement('div');
            chapterCard.className = 'chapter-card';
            chapterCard.style.setProperty('--delay', index);
            chapterCard.innerHTML = `
              <div class="chapter-info">
                <h3>Chapter ${chapter.number}: ${chapter.title}</h3>
                <p class="chapter-date">Released: ${chapter.releaseDate}</p>
              </div>
              <div class="chapter-actions">
                <button class="read-chapter-btn" onclick="openChapterReader(${chapter.number})">Read</button>
              </div>
            `;
            chapterList.appendChild(chapterCard);
          });
          // Update pagination info and button states
          document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
          document.getElementById('prevPage').disabled = currentPage === 1;
          document.getElementById('nextPage').disabled = currentPage === totalPages;
        }

        // Function to open chapter reader (to be implemented)
        window.openChapterReader = function(chapterNumber) {
          // Redirect to chapter reader page or open a modal
          window.location.href = `reader.html?comicId=${comicId}&chapter=${chapterNumber}`;
        }

        renderChapters();

        // Pagination button event listeners
        document.getElementById('prevPage').addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            renderChapters();
          }
        });
        document.getElementById('nextPage').addEventListener('click', () => {
          if (currentPage < totalPages) {
            currentPage++;
            renderChapters();
          }
        });
      })
      .catch(error => {
        console.error('Error fetching comics data:', error);
        document.querySelector('.container').innerHTML = '<p>Error loading comic details.</p>';
      });
  }
});