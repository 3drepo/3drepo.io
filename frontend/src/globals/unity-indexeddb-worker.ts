export class IndexedDbWorker {
    helloWorld() {
	}
}

let DB;
let index;

onmessage = (e) => {
    console.log(e);

    if(e.data == "open"){

        const request = indexedDB.open("3DRepoCacheDb");

        request.onsuccess = (ev) =>{
            DB = ev.target.result;

            const transaction = DB.transaction("3DRepoCache", 'readonly')
            const objectStore = transaction.objectStore("3DRepoCache");
            const request = objectStore.getAllKeys();

            request.onsuccess = () =>{
                index = {};
                request.result.forEach(x => index[x] = 1) // Give any value here - we will only check the existence of the key (property)
            };
        }
    }

    if(e.data == "benchmark"){
        const transaction = DB.transaction("3DRepoCache","readonly");
		const objectStore = transaction.objectStore("3DRepoCache");

		for(var i = 0 ; i < 100; i++){
			var key = Math.floor(Object.keys(index).length * Math.random());
			
			const start = performance.now();
			const request = objectStore.get(key);

			request.onsuccess = (ev) =>{
				console.log(`Time ${performance.now() - start}`);
			};
		}
    }

}