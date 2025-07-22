<div id="{{ $id }}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
        <div class="flex items-center justify-between mb-4 border-b pb-3">
            <h3 class="text-lg font-semibold text-gray-800">{{ $title }}</h3>
            <button
                type="button"
                onclick="closeModal('{{ $id }}')"
                class="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div>
            {{ $slot }}
        </div>
    </div>
</div>

@once
@push('scripts')
<script>
    function openModal(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Prevent scrolling background
    }

    function closeModal(id) {
        document.getElementById(id).classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
</script>
@endpush
@endonce